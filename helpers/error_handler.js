const errorHandler = (res, error) => {
  res.status(400).send({ message: `Xatolik: ${error}` });
};

module.exports = {
  errorHandler,
};
