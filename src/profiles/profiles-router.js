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
    let updatedProfile = {};
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

    if (username) {
      updatedProfile.username = username;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'username' in request body` });
    }

    if (bio) {
      updatedProfile.bio = bio;
    } else {
      return res.status(400).json({ error: `Missing 'bio' in request body` });
    }

    if (profile_pic) {
      updatedProfile.profile_pic = profile_pic;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'profile_pic' in request body` });
    }

    if (interests) {
      updatedProfile.interests = interests;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'interests' in request body` });
    }

    if (pronouns) {
      updatedProfile.pronouns = pronouns;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'pronouns' in request body` });
    }

    if (zipcode) {
      updatedProfile.zipcode = zipcode;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'zipcode' in request body` });
    }

    if (blocked_profiles) {
      updatedProfile.blocked_profiles = blocked_profiles;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'blocked_profiles' in request body` });
    }

    if (favorited_profiles) {
      updatedProfile.favorited_profiles = favorited_profiles;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'favorited_profiles' in request body` });
    }

    ProfilesService.updateProfile(
      req.app.get("db"),
      req.params.profile_id,
      updatedProfile
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
