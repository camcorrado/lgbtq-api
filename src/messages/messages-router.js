const express = require("express");
const MessagesService = require("./messages-service");
const path = require("path");
const ProfilesService = require("../profiles/profiles-service");
const { requireAuth } = require("../middleware/jwt-auth");

const messagesRouter = express.Router();

messagesRouter
  .route("/")
  .get((req, res, next) => {
    MessagesService.getAllMessages(req.app.get("db"))
      .then((messages) => {
        res.json(messages.map(MessagesService.serializeMessage));
      })
      .catch(next);
  })
  .post(requireAuth, (req, res, next) => {
    const { content, msg_read } = req.body;
    const newMessage = { content, msg_read };

    for (const [key, value] of Object.entries(newMessage)) {
      if (value == null) {
        return res
          .status(400)
          .json({ error: `Missing '${key}' in request body` });
      }
    }

    ProfilesService.getProfileForUser(req.app.get("db"), req.user.id)
      .then((profile) => {
        const profileInfo = ProfilesService.serializeProfile(profile);
        const profileId = profileInfo.id;

        newMessage.user_id = profileId;
        newMessage.conversation_id = req.body.conversation_id;

        MessagesService.insertMessage(req.app.get("db"), newMessage).then(
          (message) => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${message.id}`))
              .json(MessagesService.serializeMessage(message));
          }
        );
      })

      .catch(next);
  });

messagesRouter
  .route("/:message_id")
  .all(checkMessageExists)
  .get((req, res) => {
    res.json(MessagesService.serializeMessage(res.message));
  })
  .patch((req, res, next) => {
    let updatedMessage = {};
    const { msg_read } = req.body;

    if (msg_read) {
      updatedMessage.msg_read = msg_read;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'msg_read' in request body` });
    }

    MessagesService.updateMessage(
      req.app.get("db"),
      req.params.message_id,
      updatedMessage
    )
      .then(() => res.status(204).end())
      .catch(next);
  });

async function checkMessageExists(req, res, next) {
  try {
    const message = await MessagesService.getById(
      req.app.get("db"),
      req.params.message_id
    );

    if (!message) {
      return res.status(404).json({ error: `Message doesn't exist` });
    }

    res.message = message;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = messagesRouter;
