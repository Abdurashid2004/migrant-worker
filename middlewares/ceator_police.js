const { to } = require("../helpers/to_promise");
const myJwt = require("../services/jwt.services");

module.exports = async function (request, response, next) {
  try {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return response.status(403).json({ message: `admin isn't registered` });
    }

    const bearer = authorization.split(" ")[0];
    const token = authorization.split(" ")[1];

    if (bearer != "Bearer" || !token) {
      return response.status(403).json({ message: "admin isn't registered" });
    }

    const [error, decodedToken] = await to(myJwt.verifyAccessToken(token));
    if (error) {
      return response.status(403).json({ message: error.message });
    }

    request.admin = decodedToken;

    const { is_creator } = decodedToken;
    console.log(is_creator);

    if (!is_creator) {
      return response
        .status(401)
        .send({ message: `Sizda admin qoshish imtiyozi yo'q` });
    }

    next();
  } catch (error) {
    console.log(error);
    return response
      .status(403)
      .send({ message: `admin isn't registered (token noto'g'ri)` });
  }
};
