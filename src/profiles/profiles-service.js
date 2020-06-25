const xss = require("xss");

const ProfilesService = {
  getAllProfiles(knex) {
    return knex.select("*").from("profiles");
  },
  getById(knex, id) {
    return knex.from("profiles").select("*").where("id", id).first();
  },
  getProfileForUser(knex, id) {
    return knex.from("profiles").select("*").where("user_id", id);
  },
  insertProfile(knex, newProfile) {
    return knex
      .insert(newProfile)
      .into("profiles")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  updateProfile(knex, id, newProfileFields) {
    return knex("profiles").where({ id }).update(newProfileFields);
  },
  serializeProfile(profile) {
    return {
      id: profile.id,
      user_id: profile.user_id,
      username: xss(profile.username),
      bio: xss(profile.bio),
      profile_pic: xss(profile.profile_pic),
      interests: profile.interests,
      pronouns: xss(profile.pronouns),
      zipcode: profile.zipcode,
    };
  },
};

module.exports = ProfilesService;
