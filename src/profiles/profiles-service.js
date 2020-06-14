const xss = require('xss')

const ProfilesService = {
  	getAllProfiles(knex) {
    	return knex.select('*').from('lgbtq_profiles')
	},
	getById(knex, id) {
		return knex.from('lgbtq_profiles').select('*').where('id', id).first()
	},
	getProfileForUser(knex, id) {
		return knex.from('lgbtq_profiles').select('*').where('user_id', id)
	},
	insertProfile(knex, newProfile) {
		return knex
			.insert(newProfile)
			.into('lgbtq_profiles')
			.returning('*')
			.then(rows => {
				return rows[0]
		})
	},
	updateProfile(knex, id, newProfileFields) {
        return knex('lgbtq_profiles')
            .where({ id })
            .update(newProfileFields)
    },
	serializeProfile(profile) {
		return {
			id: profile.id,
			user_id: profile.user_id,
			username: xss(profile.username),
			bio: xss(profile.bio),
			profile_pic: xss(profile.profile_pic),
			interests: xss(profile.interests),
			pronouns: xss(profile.pronouns),
			zipcode: profile.zipcode,
		}
	},
}

module.exports = ProfilesService
