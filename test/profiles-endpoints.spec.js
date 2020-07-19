const app = require("../src/app");
const helpers = require("./test-helpers");
const knex = require("knex");

describe("Profiles Endpoints", function () {
  let db;

  const { testUsers, testProfiles } = helpers.makeFixtures();

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

  describe(`GET /api/profiles`, () => {
    context(`Given no profiles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/profiles").expect(200, []);
      });
    });

    context("Given there are profiles in the database", () => {
      beforeEach("insert profiles", () =>
        helpers.seedProfiles(db, testUsers, testProfiles)
      );

      it("responds with 200 and all of the profiles", () => {
        const expectedProfiles = testProfiles.map((profile) =>
          helpers.makeExpectedProfile(profile)
        );

        return supertest(app)
          .get("/api/profiles")
          .expect(200, expectedProfiles);
      });
    });

    context(`Given an XSS attack profile`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousProfile,
        expectedProfile,
      } = helpers.makeMaliciousProfile(testUser);

      beforeEach("insert malicious profile", () => {
        return helpers.seedMaliciousProfile(db, testUser, maliciousProfile);
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/profiles`)
          .expect(200)
          .expect((res) => {
            expect(res.body[0].username).to.eql(expectedProfile.username);
            expect(res.body[0].bio).to.eql(expectedProfile.bio);
            expect(res.body[0].profile_pic).to.eql(expectedProfile.profile_pic);
            expect(res.body[0].pronouns).to.eql(expectedProfile.pronouns);
          });
      });
    });
  });

  describe(`GET /api/profiles/:profile_id`, () => {
    context(`Given no profiles`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const profileId = 123456;
        return supertest(app)
          .get(`/api/profiles/${profileId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Profile doesn't exist` });
      });
    });

    context("Given there are profiles in the database", () => {
      beforeEach("insert profiles", () =>
        helpers.seedProfiles(db, testUsers, testProfiles)
      );

      it("responds with 200 and the specified profile", () => {
        const profileId = 2;
        const expectedProfile = helpers.makeExpectedProfile(
          testProfiles[profileId - 1]
        );

        return supertest(app)
          .get(`/api/profiles/${profileId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedProfile);
      });
    });

    context(`Given an XSS attack profile`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousProfile,
        expectedProfile,
      } = helpers.makeMaliciousProfile(testUser);

      beforeEach("insert malicious profile", () => {
        return helpers.seedMaliciousProfile(db, testUser, maliciousProfile);
      });

      it("removes XSS attack content", () => {
        return supertest(app)
          .get(`/api/profiles/${maliciousProfile.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect((res) => {
            expect(res.body.username).to.eql(expectedProfile.username);
            expect(res.body.bio).to.eql(expectedProfile.bio);
          });
      });
    });
  });

  describe(`POST /api/profiles`, () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

    it(`creates a profile, responding with 201 and the new profile`, function () {
      const testUser = testUsers[0];
      const newProfile = {
        user_id: testUser.id,
        username: "test username",
        bio: "test bio",
        profile_pic: "test profile_pic",
        interests: ["test interests"],
        pronouns: "test pronouns",
        geolocation: "40.7043986, -73.9018292",
        blocked_profiles: [666],
        favorited_profiles: [999],
      };

      let geoData = newProfile.geolocation
        .replace("(", "")
        .replace(")", "")
        .split(",");

      return supertest(app)
        .post("/api/profiles")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newProfile)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property("id");
          expect(res.body.user_id).to.eql(newProfile.user_id);
          expect(res.body.username).to.eql(newProfile.username);
          expect(res.body.bio).to.eql(newProfile.bio);
          expect(res.body.profile_pic).to.eql(newProfile.profile_pic);
          expect(res.body.interests).to.eql(newProfile.interests);
          expect(res.body.pronouns).to.eql(newProfile.pronouns);
          expect(res.body.geolocation).to.eql({
            x: Number(geoData[0]),
            y: Number(geoData[1]),
          });
          expect(res.body.blocked_profiles).to.eql(newProfile.blocked_profiles);
          expect(res.body.favoritedProfiles).to.eql(
            newProfile.favoritedProfiles
          );
          expect(res.headers.location).to.eql(`/api/profiles/${res.body.id}`);
        })
        .expect((res) =>
          db
            .from("profiles")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.user_id).to.eql(newProfile.user_id);
              expect(row.username).to.eql(newProfile.username);
              expect(row.bio).to.eql(newProfile.bio);
              expect(row.profile_pic).to.eql(newProfile.profile_pic);
              expect(row.interests).to.eql(newProfile.interests);
              expect(row.pronouns).to.eql(newProfile.pronouns);
              expect(row.geolocation).to.eql({
                x: Number(geoData[0]),
                y: Number(geoData[1]),
              });
              expect(row.blocked_profiles).to.eql(newProfile.blocked_profiles);
              expect(row.favoritedProfiles).to.eql(
                newProfile.favoritedProfiles
              );
            })
        );
    });

    const requiredFields = [
      "username",
      "bio",
      "profile_pic",
      "interests",
      "pronouns",
      "geolocation",
    ];

    requiredFields.forEach((field) => {
      const newProfile = {
        username: "test username",
        bio: "test bio",
        profile_pic: "test profile_pic",
        interests: ["test interests"],
        pronouns: "test pronouns",
        geolocation: "40.7043986, -73.9018292",
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newProfile[field];
        return supertest(app)
          .post("/api/profiles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newProfile)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });
  });

  describe(`PATCH /api/profiles/:profile_id`, () => {
    context("Given there are profiles in the database", () => {
      beforeEach("insert profiles", () =>
        helpers.seedProfiles(db, testUsers, testProfiles)
      );

      const requiredFields = [
        "username",
        "bio",
        "profile_pic",
        "interests",
        "pronouns",
        "geolocation",
        "blocked_profiles",
        "favorited_profiles",
      ];

      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          username: "test patch username",
          bio: "test patch bio",
          profile_pic: "test patch profile_pic",
          interests: ["Gaming"],
          pronouns: "test patch pronouns",
          geolocation: "40.7043986, -73.9018292",
          blocked_profiles: [1, 2],
          favorited_profiles: [3, 4],
          ...testProfiles[0],
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .patch(`/api/profiles/1`)
            .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
            .send(registerAttemptBody)
            .expect(400, { error: `Missing '${field}' in request body` });
        });
      });

      it("responds with 204 and updates the profile", () => {
        const idToUpdate = 1;
        const updatedProfile = {
          username: "updated profile username",
          bio: "updated profile bio",
          profile_pic: "updated profile pic",
          interests: ["updated interests"],
          pronouns: "updated pronouns",
          geolocation: "40.7043986, -73.9018292",
          blocked_profiles: [666],
          favorited_profiles: [999],
        };

        let geoData = updatedProfile.geolocation
          .replace("(", "")
          .replace(")", "")
          .split(",");

        const expectedProfile = {
          ...testProfiles[idToUpdate - 1],
          ...updatedProfile,
          geolocation: {
            x: Number(geoData[0]),
            y: Number(geoData[1]),
          },
        };
        return supertest(app)
          .patch(`/api/profiles/${idToUpdate}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedProfile)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/profiles/${idToUpdate}`)
              .expect(expectedProfile)
          );
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 1;
        const updatedProfile = {
          ...testProfiles[0],
          username: "updated profile username",
        };

        let geoData = updatedProfile.geolocation
          .replace("(", "")
          .replace(")", "")
          .split(",");

        const expectedProfile = {
          ...testProfiles[1],
          ...updatedProfile,
          geolocation: {
            x: Number(geoData[0]),
            y: Number(geoData[1]),
          },
        };
        return supertest(app)
          .patch(`/api/profiles/${idToUpdate}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .send({
            ...updatedProfile,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/profiles/${idToUpdate}`)
              .expect(expectedProfile)
          );
      });
    });
  });
});
