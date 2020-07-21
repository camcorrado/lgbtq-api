const AuthService = require("../auth/auth-service");

function requireAuth(req, res, next) {
  const authToken = req.get("Authorization") || "";

  let bearerToken;
  if (!authToken.toLowerCase().startsWith("bearer ")) {
    console.log("first part failed");
    return res.status(401).json({ error: "Missing bearer token" });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);

    AuthService.getUserWithEmail(req.app.get("db"), payload.sub)
      .then((user) => {
        if (!user) {
          console.log("second part failed");

          return res.status(401).json({ error: "Missing bearer token" });
        }

        req.user = user;
        next();
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    console.log("catch part failed");

    res.status(401).json({ error: "Missing bearer token" });
  }
}

module.exports = { requireAuth };
