const Joi = require("joi");

exports.countryValidation = (date) => {
  const schema = Joi.object({
    name: Joi.string().pattern(new RegExp("^[a-zA-Z]+$")).min(2).max(50),
    flag: Joi.string(),
  });
  return schema.validate(date, { abortEarly: false });
};
 