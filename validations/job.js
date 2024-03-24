const Joi = require("joi");

exports.jobValidation = (date) => {
  const schema = Joi.object({
    name: Joi.string().pattern(new RegExp("^[a-zA-Z]+$")).min(2).max(50),
    description: Joi.string(),
    icon: Joi.string(),
  });
  return schema.validate(date, { abortEarly: false });
};
