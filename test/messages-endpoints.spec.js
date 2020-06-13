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
    context.only(`Given no messages`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/messages')
          .expect(200, [])
      })
    })

    context('Given there are messages in the database', () => {
      beforeEach('insert messages', () =>
        helpers.seedMessagesTable(
          db,
          testConversations,
          testMessages,
        )
      )

      it('responds with 200 and all of the messages', () => {
        const expectedMessages = testMessages.map(message =>
          helpers.makeExpectedMessage(
            testConversations,
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
        helpers.seedMessagesTable(
          db,
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
        helpers.seedMessagesTable(
          db,
          testConversations,
          testMessages,
        )
      )

      it('responds with 200 and the specified message', () => {
        const messageId = 2
        const expectedMessage = helpers.makeExpectedMessage(
          testConversations,
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

  describe(`POST /api/profiles`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers,
      )
    )

    it(`creates a profile, responding with 201 and the new profile`, function() {
      const testUser = testUsers[0]
      const newProfile = {
        user_id: testUser.id,
        username: 'test username',
        bio: 'test bio',
        profile_pic: 'test profile_pic',
        interests: 'test interests',
        pronouns: 'test pronouns',
        zipcode: 123456,
      }
      return supertest(app)
        .post('/api/profiles')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newProfile)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.user_id).to.eql(newProfile.user_id)
          expect(res.body.username).to.eql(newProfile.username)
          expect(res.body.bio).to.eql(newProfile.bio)
          expect(res.body.profile_pic).to.eql(newProfile.profile_pic)
          expect(res.body.interests).to.eql(newProfile.interests)
          expect(res.body.pronouns).to.eql(newProfile.pronouns)
          expect(res.body.zipcode).to.eql(newProfile.zipcode)
          expect(res.body.user.id).to.eql(testUser.id)
          expect(res.headers.location).to.eql(`/api/profiles/${res.body.id}`)
        })
        .expect(res =>
          db
            .from('lgbtq_profiles')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.user_id).to.eql(newProfile.user_id)
              expect(row.username).to.eql(newProfile.username)
              expect(row.bio).to.eql(newProfile.bio)
              expect(row.profile_pic).to.eql(newProfile.profile_pic)
              expect(row.interests).to.eql(newProfile.interests)
              expect(row.pronouns).to.eql(newProfile.pronouns)
              expect(row.zipcode).to.eql(newProfile.zipcode)
            })
        )
    })

    const requiredFields = ['user_id', 'username', 'bio', 'profile_pic', 'interests', 'pronouns', 'zipcode']

    requiredFields.forEach(field => {
      const newProfile = {
        user_id: 'test user_id',
        username: 'test username',
        bio: 'test bio',
        profile_pic: 'test profile_pic',
        interests: 'test interests',
        pronouns: 'test pronouns',
        zipcode: 'test zipcode',
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newProfile[field]

        return supertest(app)
          .post('/api/profiles')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newProfile)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })
  })
})