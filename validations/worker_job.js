const Joi = require("joi");

exports.worker_jobValidation = (date) => {
  const schema = Joi.object({
    worker_id: Joi.string().alphanum(),
    job_id: Joi.string().alphanum(),
  });
  return schema.validate(date, { abortEarly: false });
};
