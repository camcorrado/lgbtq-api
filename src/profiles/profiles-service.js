const xss = require('xss')

const ProfilesService = {
  getAllProfiles(db) {
    return db
      .from('lgbtq_profiles AS profile')
      .select(
        'profile.id',
        'profile.user_id',
        'profile.username',
        'profile.bio',
        'profile.profile_pic',
        'profile.interests',
        'profile.pronouns',
        'profile.zipcode',
        db.raw(
          `json_strip_nulls(
            json_build_object(
              'id', usr.id,
              'full_name', usr.full_name,
              'email', usr.email,
              'date_created', usr.date_created
            )
          ) AS "user"`
        ),
      )
      .leftJoin(
        'lgbtq_users AS usr',
        'profile.user_id',
        'usr.id',
      )
      .groupBy('profile.id', 'usr.id')
  },

  getById(db, id) {
    return ProfilesService.getAllProfiles(db)
      .where('profile.id', id)
      .first()
  },

  getProfileForUser(db, profile_id) {
    return db
      .from('lgbtq_profiles AS profile')
      .select(
        'profile.id',
        'profile.user_id',
        'profile.username',
        'profile.bio',
        'profile.profile_pic',
        'profile.interests',
        'profile.pronouns',
        'profile.zipcode',
        db.raw(
          `json_strip_nulls(
            row_to_json(
              (SELECT tmp FROM (
                SELECT
                  user.id,
                  user.full_name,
                  user.email,
                  user.date_created,
              ) tmp)
            )
          ) AS "user"`
        )
      )
      .where('profile.user_id', profile_id)
      .leftJoin(
        'lgbtq_users AS user',
        'profile.user_id',
        'user.id',
      )
      .groupBy('profile.id', 'user.id')
  },

  insertProfile(db, newProfile) {
    return db
      .insert(newProfile)
      .into('lgbtq_profiles')
      .returning('*')
      .then(([profile]) => profile)
      .then(profile =>
        ProfilesService.getById(db, profile.id)
      )
  },

  serializeProfile(profile) {
    const { user } = profile
    return {
      id: profile.id,
      user_id: profile.user_id,
      username: xss(profile.username),
      bio: xss(profile.bio),
      profile_pic: xss(profile.profile_pic),
      interests: xss(profile.interests),
      pronouns: xss(profile.pronouns),
      zipcode: profile.zipcode,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        date_created: new Date(user.date_created),
      },
    }
  },
}

module.exports = ProfilesService
