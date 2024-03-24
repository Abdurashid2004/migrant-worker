const Joi = require("joi");

exports.employerValidation = (date) => {
  const schema = Joi.object({
    company_name: Joi.string()
      .pattern(new RegExp("^[a-zA-Z]+$"))
      .min(2)
      .max(50),
    industry: Joi.string(),
    address: Joi.string(),
    location: Joi.string(),
    contact_name: Joi.string()
      .pattern(new RegExp("^[a-zA-Z]+$"))
      .min(2)
      .max(50),
    contact_passport: Joi.string(),
    contact_email: Joi.string().email(),
    contact_phone: Joi.string(),
    hashed_password: Joi.string(),
    hashed_refresh_token: Joi.string(),
  });
  return schema.validate(date, { abortEarly: false });
};
