const express = require("express");
const path = require("path");
const ProfilesService = require("./profiles-service");
const { requireAuth } = require("../middleware/jwt-auth");

const profilesRouter = express.Router();

profilesRouter
  .route("/")
  .get((req, res, next) => {
    ProfilesService.getAllProfiles(req.app.get("db"))
      .then((profiles) => {
        res.json(profiles.map(ProfilesService.serializeProfile));
      })
      .catch(next);
  })
  .post(requireAuth, (req, res, next) => {
    const {
      username,
      bio,
      profile_pic,
      interests,
      pronouns,
      zipcode,
      blocked_profiles,
      favorited_profiles,
    } = req.body;
    const newProfile = {
      username,
      bio,
      profile_pic,
      interests,
      pronouns,
      zipcode,
      blocked_profiles,
      favorited_profiles,
    };

    for (const [key, value] of Object.entries(newProfile)) {
      if (value == null) {
        return res
          .status(400)
          .json({ error: `Missing '${key}' in request body` });
      }
    }

    newProfile.user_id = req.user.id;

    ProfilesService.insertProfile(req.app.get("db"), newProfile)
      .then((profile) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${profile.id}`))
          .json(ProfilesService.serializeProfile(profile));
      })
      .catch(next);
  });

profilesRouter
  .route("/:profile_id")
  .all(checkProfileExists)
  .get((req, res) => {
    res.json(ProfilesService.serializeProfile(res.profile));
  })
  .patch(requireAuth, (req, res, next) => {
    const {
      username,
      bio,
      profile_pic,
      interests,
      pronouns,
      zipcode,
      blocked_profiles,
      favorited_profiles,
    } = req.body;
    const profileToUpdate = {
      username,
      bio,
      profile_pic,
      interests,
      pronouns,
      zipcode,
      blocked_profiles,
      favorited_profiles,
    };

    const numberOfValues = Object.values(profileToUpdate).filter(Boolean)
      .length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'username', 'bio', 'profile_pic', 'interests', 'pronouns', 'zipcode', 'blocked_profiles', 'favorited_profiles'`,
      });
    }

    ProfilesService.updateProfile(
      req.app.get("db"),
      req.params.profile_id,
      profileToUpdate
    )
      .then(() => res.status(204).end())
      .catch(next);
  });

async function checkProfileExists(req, res, next) {
  try {
    const profile = await ProfilesService.getById(
      req.app.get("db"),
      req.params.profile_id
    );

    if (!profile) {
      return res.status(404).json({ error: `Profile doesn't exist` });
    }

    res.profile = profile;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = profilesRouter;
