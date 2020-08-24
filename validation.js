//Validation
const Joi = require('@hapi/joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        userName: Joi.string().min(4).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
        nameFirst: Joi.string().min(1).max(255).required(),
        nameMiddle: Joi.string().min(1).max(255),
        nameLast: Joi.string().min(1).max(255).required(),
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

const userValidation = (data, isAdmin) => {
    const schema = Joi.object({
        nameFirst: Joi.string().min(1).max(255),
        nameMiddle: Joi.string().min(1).max(255),
        nameLast: Joi.string().min(1).max(255),
        email: Joi.string().min(1).max(255).email(),
        password: Joi.string().min(1).max(1024),
        oldPassword: Joi.string().min(1).max(1024),
        currentTenant: Joi.boolean(),
        owner: Joi.boolean()
    }).options({ allowUnknown: false });
    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.userValidation = userValidation;