const app = require("../src/app");
const helpers = require("./test-helpers");
const knex = require("knex");
const moment = require("moment");

describe("Conversations Endpoints", function () {
  let db;

  const { testUsers, testConversations } = helpers.makeFixtures();

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
    context(`Given no conversations`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/conversations").expect(200, []);
      });
    });

    context("Given there are conversations in the database", () => {
      beforeEach("insert conversations", () =>
        helpers.seedConversations(db, testConversations)
      );

      it("responds with 200 and all of the conversations", () => {
        const expectedConversations = testConversations.map((conversation) =>
          helpers.makeExpectedConversation(conversation)
        );
        return supertest(app)
          .get("/api/conversations")
          .expect(200, expectedConversations);
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
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Conversation doesn't exist` });
      });
    });

    context("Given there are conversations in the database", () => {
      beforeEach("insert conversations", () =>
        helpers.seedConversations(db, testConversations)
      );

      it("responds with 200 and the specified conversation", () => {
        const conversationId = 2;
        const expectedConversation = helpers.makeExpectedConversation(
          testConversations[conversationId - 1]
        );

        return supertest(app)
          .get(`/api/conversations/${conversationId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedConversation);
      });
    });
  });

  describe(`POST /api/conversations`, () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

    beforeEach("insert conversations", () =>
      helpers.seedConversations(db, testConversations)
    );

    it(`creates a conversation, responding with 201 and the new conversation`, function () {
      const newConversation = {
        users: "Test new users",
        ...testConversations[0],
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
});
