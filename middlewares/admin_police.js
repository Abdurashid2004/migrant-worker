const myJwt = require("../services/jwt.services");
const { to } = require("../helpers/to_promise");

module.exports = async function (req, res, next) {
  try {
    const authorizaton = req.headers.authorization;

    if (!authorizaton)
      return res.status(403).json({ message: "Admin ro'yxatdan o'tmagan" });

    const bearer = authorizaton.split(" ")[0];
    const token = authorizaton.split(" ")[1];

    if (bearer != "Bearer" || !token) {
      return res.status(403).json({
        message: "Admin ro'yxatdan o'tmagan (token berilmagan)",
      });
    }
    const [error, decodedToken] = await to(myJwt.verifyAccessToken(token));
    if (error) {
      return res.status(403).json({ message: error.message });
    }
    console.log(decodedToken);
    req.admin = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .send({ message: "Admin ro'yxatdan o'tmagan (token notog'ri)" });
  }
};
