const Joi = require("joi");

exports.vacansyValidation = (date) => {
  const schema = Joi.object({
    employer_id: Joi.string(), 
    city: Joi.string().min(2).max(50), 
    job_id: Joi.string().alphanum(),
    salary: Joi.number().positive(), 
    description: Joi.string(), 
    requirements: Joi.string(), 
    internship: Joi.boolean(), 
    job_type: Joi.string(), 
    work_hour: Joi.number().positive(), 
    medecine: Joi.boolean(), 
    housing: Joi.boolean(), 
    gender: Joi.string().valid("Male", "Female"),
    age_limit: Joi.date().less(new Date("2000-01-01")),
    graduate: Joi.boolean(), 
    exprience: Joi.string(), 
    trial_period: Joi.number().positive(),
  });
  return schema.validate(date, { abortEarly: false });
};
