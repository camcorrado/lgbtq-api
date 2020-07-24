const app = require("../src/app");
const helpers = require("./test-helpers");
const knex = require("knex");
const moment = require("moment");

describe("Messages Endpoints", function () {
  let db;

  const {
    testUsers,
    testProfiles,
    testConversations,
    testMessages,
  } = helpers.makeFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`GET /api/messages`, () => {
    context(`Given no messages`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/messages").expect(200, []);
      });
    });

    context("Given there are messages in the database", () => {
      beforeEach("insert messages", () =>
        helpers.seedMessages(
          db,
          testUsers,
          testProfiles,
          testConversations,
          testMessages
        )
      );

      it("responds with 200 and all of the messages", () => {
        const expectedMessages = testMessages.map((message) =>
          helpers.makeExpectedMessage(message)
        );
        return supertest(app)
          .get("/api/messages")
          .expect(200, expectedMessages);
      });
    });

    context(`Given an XSS attack message`, () => {
      const testConversation = helpers.makeConversationsArray()[1];
      const testUser = helpers.makeUsersArray()[1];
      const testProfile = helpers.makeProfilesArray(testUsers)[1];
      const {
        maliciousMessage,
        expectedMessage,
      } = helpers.makeMaliciousMessage(testConversation, testUser);

      beforeEach("insert malicious message", () => {
        return helpers.seedMaliciousMessage(
          db,
          testUser,
          testProfile,
          testConversation,
          maliciousMessage
        );
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/messages`)
          .expect(200)
          .expect((res) => {
            expect(res.body[0].content).to.eql(expectedMessage.content);
          });
      });
    });
  });

  describe(`GET /api/messages/:message_id`, () => {
    context(`Given no messages`, () => {
      beforeEach("insert messages", () =>
        helpers.seedMessages(
          db,
          testUsers,
          testProfiles,
          testConversations,
          testMessages
        )
      );

      it(`responds with 404`, () => {
        const messageId = 123456;
        return supertest(app)
          .get(`/api/messages/${messageId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Message doesn't exist` });
      });
    });

    context("Given there are messages in the database", () => {
      beforeEach("insert messages", () =>
        helpers.seedMessages(
          db,
          testUsers,
          testProfiles,
          testConversations,
          testMessages
        )
      );

      it("responds with 200 and the specified message", () => {
        const messageId = 2;
        const expectedMessage = helpers.makeExpectedMessage(
          testMessages[messageId - 1]
        );

        return supertest(app)
          .get(`/api/messages/${messageId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedMessage);
      });
    });

    context(`Given an XSS attack message`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const testConversation = helpers.makeConversationsArray()[1];
      const testProfile = helpers.makeProfilesArray(testUsers)[1];
      const {
        maliciousMessage,
        expectedMessage,
      } = helpers.makeMaliciousMessage(testConversation, testUser);
      beforeEach("insert malicious message", () => {
        return helpers.seedMaliciousMessage(
          db,
          testUser,
          testProfile,
          testConversation,
          maliciousMessage
        );
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/messages/${maliciousMessage.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect((res) => {
            expect(res.body.content).to.eql(expectedMessage.content);
          });
      });
    });
  });

  describe(`POST /api/messages`, () => {
    beforeEach("insert messages", () =>
      helpers.seedMessages(
        db,
        testUsers,
        testProfiles,
        testConversations,
        testMessages
      )
    );

    it(`creates a messages, responding with 201 and the new message`, function () {
      const testUser = testUsers[0];
      const testConversation = testConversations[0];
      const newMessage = {
        conversation_id: testConversation.id,
        user_id: testUser.id,
        content: "test content",
        msg_read: "false",
      };
      return supertest(app)
        .post("/api/messages")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newMessage)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property("id");
          expect(res.body.user_id).to.eql(newMessage.user_id);
          expect(res.body.conversation_id).to.eql(newMessage.conversation_id);
          expect(res.body.content).to.eql(newMessage.content);
          expect(res.body.msg_read).to.eql(newMessage.msg_read);
          const expectedDate = moment(new Date()).format("ddd MMM DD YYYY");
          const actualDate = moment(new Date(res.body.date_created)).format(
            "ddd MMM DD YYYY"
          );
          expect(actualDate).to.eql(expectedDate);
        })
        .expect((res) =>
          db
            .from("messages")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(res.body).to.have.property("id");
              expect(row.user_id).to.eql(newMessage.user_id);
              expect(row.conversation_id).to.eql(newMessage.conversation_id);
              expect(row.content).to.eql(newMessage.content);
              expect(row.msg_read).to.eql(newMessage.msg_read);
              const expectedDate = moment(new Date()).format("ddd MMM DD YYYY");
              const actualDate = moment(new Date(res.body.date_created)).format(
                "ddd MMM DD YYYY"
              );
              expect(actualDate).to.eql(expectedDate);
            })
        );
    });

    const requiredFields = ["content"];

    requiredFields.forEach((field) => {
      const newMessage = {
        msg_read: "false",
        content: "test content",
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newMessage[field];

        return supertest(app)
          .post("/api/messages")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newMessage)
          .expect(400, { error: `Missing '${field}' in request body` });
      });
    });
  });

  describe(`PATCH /api/messages/:messages_id`, () => {
    context("Given there are messages in the database", () => {
      beforeEach("insert messages", () =>
        helpers.seedMessages(
          db,
          testUsers,
          testProfiles,
          testConversations,
          testMessages
        )
      );

      const requiredFields = ["msg_read"];

      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          msg_read: "true",
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .patch(`/api/messages/1`)
            .send(registerAttemptBody)
            .expect(400, { error: `Missing '${field}' in request body` });
        });
      });

      it("responds with 204 and updates the message", () => {
        const idToUpdate = 1;
        const updatedMessage = {
          msg_read: "true",
        };

        const expectedMessage = {
          ...testMessages[idToUpdate - 1],
          ...updatedMessage,
        };

        return supertest(app)
          .patch(`/api/messages/${idToUpdate}`)
          .send(updatedMessage)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/messages/${idToUpdate}`)
              .expect(expectedMessage)
          );
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 1;
        const updatedMessage = {
          ...testMessages[0],
          msg_read: "true",
        };

        const expectedMessage = {
          ...testMessages[1],
          ...updatedMessage,
        };
        return supertest(app)
          .patch(`/api/messages/${idToUpdate}`)
          .send({
            ...updatedMessage,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/messages/${idToUpdate}`)
              .expect(expectedMessage)
          );
      });
    });
  });
});
