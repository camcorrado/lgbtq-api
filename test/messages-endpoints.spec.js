const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Messages Endpoints', function() {
    let db

    const {
        testUsers,
        testConversations,
        testMessages,
    } = helpers.makeFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/messages`, () => {
        context(`Given no messages`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/messages')
                    .expect(200, [])
            })
        })

        context('Given there are messages in the database', () => {
            beforeEach('insert messages', () =>
                helpers.seedMessages(
                    db,
                    testUsers,
                    testConversations,
                    testMessages,
                )
            )

            it('responds with 200 and all of the messages', () => {
                const expectedMessages = testMessages.map(message =>
                    helpers.makeExpectedMessage(
                        message,
                    )
                )
                return supertest(app)
                    .get('/api/messages')
                    .expect(200, expectedMessages)
            })
        })

        context(`Given an XSS attack message`, () => {
            const testConversation = helpers.makeConversationsArray()[1]
            const testUser = helpers.makeUsersArray()[1]
            const {
                maliciousMessage,
                expectedMessage,
            } = helpers.makeMaliciousMessage(testConversation, testUser)

            beforeEach('insert malicious message', () => {
                return helpers.seedMaliciousMessage(
                    db,
                    testConversation,
                    maliciousMessage,
                    testUser
                )
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/messages`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].content).to.eql(expectedMessage.content)
                    })
            })
        })
    })

    describe(`GET /api/messages/:message_id`, () => {
        context(`Given no messages`, () => {
            beforeEach('insert messages', () =>
                helpers.seedMessages(
                db,
                testUsers,
                testConversations,
                testMessages,
            )
        )

            it(`responds with 404`, () => {
                const messageId = 123456
                return supertest(app)
                    .get(`/api/messages/${messageId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: `Message doesn't exist` })
            })
        })

        context('Given there are messages in the database', () => {
            beforeEach('insert messages', () =>
                helpers.seedMessages(
                    db,
                    testUsers,
                    testConversations,
                    testMessages,
                )
            )

            it('responds with 200 and the specified message', () => {
                const messageId = 2
                const expectedMessage = helpers.makeExpectedMessage(
                    testMessages[messageId - 1],
                )

                return supertest(app)
                    .get(`/api/messages/${messageId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedMessage)
            })
        })

        context(`Given an XSS attack message`, () => {
            const testUser = helpers.makeUsersArray()[1]
            const testConversation = helpers.makeConversationsArray()[1]
            const {
                maliciousMessage,
                expectedMessage,
            } = helpers.makeMaliciousMessage(testConversation, testUser)

            beforeEach('insert malicious message', () => {
                return helpers.seedMaliciousMessage(
                    db,
                    testConversation,
                    maliciousMessage,
                )
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/messages/${maliciousMessage.id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.content).to.eql(expectedMessage.content)
                    })
            })
        })
    })

    describe(`POST /api/messages`, () => {
        beforeEach('insert messages', () =>
            helpers.seedMessages(
                db,
                testUsers,
                testConversations,
                testMessages,
            )
        )

        it(`creates a messages, responding with 201 and the new messages`, function() {
            const testUser = testUsers[0]
            const testConversation = testConversations[0]
            const newMessage = {
                user_id: testUser.id,
                conversation_id: testConversation.id,
                content: 'test content',
            }
        return supertest(app)
            .post('/api/messages')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newMessage)
            .expect(201)
            .expect(res => {
                expect(res.body).to.have.property('id')
                expect(res.body.user_id).to.eql(newMessage.user_id)
                expect(res.body.conversation_id).to.eql(newMessage.conversation_id)
                expect(res.body.content).to.eql(newMessage.content)
                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                const actualDate = new Date(res.body.date_created).toLocaleString()
                expect(actualDate).to.eql(expectedDate)
            })
            .expect(res =>
            db
                .from('lgbtq_messages')
                .select('*')
                .where({ id: res.body.id })
                .first()
                .then(row => {
                    expect(res.body).to.have.property('id')
                    expect(row.user_id).to.eql(newMessage.user_id)
                    expect(row.conversation_id).to.eql(newMessage.conversation_id)
                    expect(row.content).to.eql(newMessage.content)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(row.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
            )
        })

        const requiredFields = ['content']

        requiredFields.forEach(field => {
            const newMessage = {
                content: 'test content'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newMessage[field]

                return supertest(app)
                    .post('/api/messages')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newMessage)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    })
            })
        })
    })
})