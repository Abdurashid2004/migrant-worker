const Joi = require("joi");

exports.applicationValidation = (date) => {
  const schema = Joi.object({
    vacancy_id: Joi.string(),
    worker_id: Joi.string(),
    application_date: Joi.date().iso(),
  });
  return schema.validate(date, { abortEarly: false });
};
