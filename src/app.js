const authRouter = require("./auth/auth-router");
const conversationsRouter = require("./conversations/conversations-router");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const messagesRouter = require("./messages/messages-router");
const morgan = require("morgan");
const { NODE_ENV } = require("./config");
const profilesRouter = require("./profiles/profiles-router");
const usersRouter = require("./users/users-router");
require("dotenv").config();

const app = express();
const { CLIENT_ORIGIN } = require("./config");
const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use(express.json());
app.use(morgan(morganOption));
app.use(helmet());
app.use("/api/auth", authRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/users", usersRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  console.log(error);
  res.status(500).json(response);
});

module.exports = app;
