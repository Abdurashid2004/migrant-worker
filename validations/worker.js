const Joi = require("joi");

exports.workerValidation = (date) => {
  const schema = Joi.object({
    first_name: Joi.string().pattern(new RegExp("^[a-zA-Z]+$")).min(2).max(50),
    last_name: Joi.string().pattern(new RegExp("^[a-zA-Z]+$")).min(2).max(50),
    birth_date: Joi.date().less(new Date("2000-01-01")),
    gender: Joi.string().valid("Male", "Female"),
    passport: Joi.string().alphanum(),
    phone_number: Joi.string(),
    email: Joi.string().email(),
    tg_link: Joi.string(),
    // .pattern(/^t\.me\/[a-zA-Z0-9_]+$/),
    hashed_password: Joi.string(),
    hashed_refresh_token: Joi.string(),
    is_active: Joi.boolean(),
    graduate: Joi.boolean(),
    skills: Joi.array().items(Joi.string()),
    experience: Joi.string(),
  });
  return schema.validate(date, { abortEarly: false });
};
