//Validation
const Joi = require('@hapi/joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        userName: Joi.string().min(4).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        nameFirst: Joi.string().min(1).required(),
        nameMiddle: Joi.string().min(1),
        nameLast: Joi.string().min(1).required(),
        currentTenant: Joi.boolean(),
        owner: Joi.boolean()
    });

    return schema.validate(data);
}

const loginValidation = (data) => {
    const schema = Joi.object({
        login: Joi.string().min(4).required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;