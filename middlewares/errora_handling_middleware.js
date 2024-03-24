const ApiError = require("../error/ApiError");

module.exports = function (err, req, res, nex) {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err instanceof SyntaxError) {
    return res.status(err.status).json({ message: err.message });
  }
  return res.status(500).json({ message: "Nazarda tutilmagan xatolik" });
};
