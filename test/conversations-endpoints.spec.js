const app = require("../src/app");
const helpers = require("./test-helpers");
const knex = require("knex");
const moment = require("moment");
const { makeConversationsArray } = require("./test-helpers");

describe("Conversations Endpoints", function () {
  let db;

  const { testUsers, testConversations, testMessages } = helpers.makeFixtures();

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

  describe(`GET /api/conversations`, () => {
    context("Given there are conversations in the database", () => {
      beforeEach("insert conversations", () =>
        helpers.seedConversations(db, testUsers, testConversations)
      );

      it("responds with 200 and all of the user's conversations", () => {
        const expectedConversations = testConversations.map((conversation) =>
          helpers.makeExpectedConversation(conversation)
        );
        return supertest(app)
          .get("/api/conversations")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [expectedConversations[0], expectedConversations[1]]);
      });
    });
  });

  describe(`GET /api/conversations/:conversation_id`, () => {
    context(`Given no conversation`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const conversationId = 123456;
        return supertest(app)
          .get(`/api/conversations/${conversationId}`)
          .expect(404, { error: `Conversation doesn't exist` });
      });
    });

    context("Given there are conversations in the database", () => {
      beforeEach("insert conversations", () =>
        helpers.seedMessages(db, testUsers, testConversations, testMessages)
      );

      it("responds with 200 and the specified conversation", () => {
        const conversationId = 2;
        const expectedConversation = helpers.makeExpectedMessage(
          testMessages[conversationId - 1]
        );

        return supertest(app)
          .get(`/api/conversations/${conversationId}`)
          .expect(200, [expectedConversation]);
      });
    });
  });

  describe(`POST /api/conversations`, () => {
    beforeEach("insert conversations", () =>
      helpers.seedConversations(db, testUsers, testConversations)
    );

    it(`creates a conversation, responding with 201 and the new conversation`, function () {
      const newConversation = {
        users: [1, 2, 3],
        new_msg: moment(new Date("2029-01-22T16:28:32.615Z")).format(
          "ddd MMM DD YYYY"
        ),
      };
      return supertest(app)
        .post("/api/conversations")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newConversation)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property("id");
          expect(res.body.users).to.eql(newConversation.users);
          expect(res.headers.location).to.eql(
            `/api/conversations/${res.body.id}`
          );
          const expectedDate = moment(new Date()).format("ddd MMM DD YYYY");
          const actualDate = moment(new Date(res.body.date_created)).format(
            "ddd MMM DD YYYY"
          );
          expect(actualDate).to.eql(expectedDate);
        })
        .expect((res) =>
          db
            .from("conversations")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.users).to.eql(newConversation.users);
              const expectedDate = moment(new Date()).format("ddd MMM DD YYYY");
              const actualDate = moment(new Date(row.date_created)).format(
                "ddd MMM DD YYYY"
              );
              expect(actualDate).to.eql(expectedDate);
            })
        );
    });

    const requiredFields = ["users"];

    requiredFields.forEach((field) => {
      const newConversation = {
        users: "Test new users",
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newConversation[field];

        return supertest(app)
          .post("/api/conversations")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newConversation)
          .expect(400, { error: `Missing '${field}' in request body` });
      });
    });
  });

  describe(`DELETE /api/conversations/:conversationId`, () => {
    context("Given there are conversations in the database", () => {
      const testConversations = makeConversationsArray();

      beforeEach("insert conversations", () =>
        helpers.seedConversations(db, testUsers, testConversations)
      );

      it("responds with 204 and removes the conversation", () => {
        const idToRemove = 2;
        const expectedConversations = testConversations.filter(
          (convo) => convo.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/conversations/${idToRemove}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/conversations`)
              .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
              .expect([expectedConversations[0]])
          );
      });
    });
  });
});
