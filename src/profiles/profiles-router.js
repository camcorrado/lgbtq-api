const express = require('express')
const path = require('path')
const ProfilesService = require('./profiles-service')
const { requireAuth } = require('../middleware/jwt-auth')

const profilesRouter = express.Router()
const jsonBodyParser = express.json()

profilesRouter
  .route('/')
  .get((req, res, next) => {
    ProfilesService.getAllProfiles(req.app.get('db'))
      .then(profiles => {
        res.json(profiles.map(ProfilesService.serializeProfile))
      })
      .catch(next)
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { user_id, username, bio, profile_pic, interests, pronouns, zipcode } = req.body
    const newProfile = { user_id, username, bio, profile_pic, interests, pronouns, zipcode }

    for (const [key, value] of Object.entries(newProfile))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    newProfile.user_id = req.user.id

    ProfilesService.insertProfile(
      req.app.get('db'),
      newProfile
    )
      .then(profile => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${profile.id}`))
          .json(ProfilesService.serializeProfile(profile))
      })
      .catch(next)
    })

  profilesRouter
  .route('/:profile_id')
  .all(requireAuth)
  .all(checkProfileExists)
  .get((req, res) => {
    res.json(ProfilesService.serializeProfile(res.profile))
  })

/* async/await syntax for promises */
async function checkProfileExists(req, res, next) {
  try {
    const profile = await ProfilesService.getById(
      req.app.get('db'),
      req.params.profile_id
    )

    if (!profile)
      return res.status(404).json({
        error: `Profile doesn't exist`
      })

    res.profile = profile
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = profilesRouter
