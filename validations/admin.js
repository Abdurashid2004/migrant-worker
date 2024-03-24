const Joi = require("joi");

exports.adminValidation = (date) => {
  const schema = Joi.object({
    name: Joi.string()
      .pattern(new RegExp("^[a-zA-Z]+$"))
      .min(2)
      .message("ism 2 ta harifdan ko'p bo'lishi kerak")
      .max(50)
      .message("ism 50 harifdan kam bo'lishi kerak "),
    email: Joi.string().email(),
    phone_number: Joi.string().pattern(new RegExp(/^\d{2}-\d{3}-\d{2}-\d{2}$/)),
    hashed_password: Joi.string().min(6),
    // confirm_password: Joi.ref("hashed_password"),
    tg_link: Joi.string(),
    // pattern(/^t\.me\/[a-zA-Z0-9_]+$/),
    description: Joi.string(),
    is_active: Joi.boolean().default(false),
    is_creator: Joi.boolean(),
    hashed_refresh_token: Joi.string(),
  });
  return schema.validate(date, { abortEarly: false });
};
