const Joi = require('joi');

class UserValidator {
    async validate(data, schema) {
        try {
            const { error, value } = await schema.validateAsync(data);
            if (error) {
                throw new Error(error.details[0].message);
            }
            return value;
        } catch (error) {
            throw new Error(`Error validating data: ${error.message}`);
        }
    }

    async signUp(data) {
        const schema = Joi.object({
            firstName: Joi.string().required().trim(),
            lastName: Joi.string().required().trim(),
            email: Joi.string().email().required().trim(),
            password: Joi.string().min(8).required().trim(),
            role: Joi.number().valid(1, 2).required(),
        });
        return await this.validate(data, schema);
    }

    async validateLogin(data) {
        const schema = Joi.object({
            email: Joi.string().email().required().trim(),
            password: Joi.string().min(8).required().trim(),
        });
        return await this.validate(data, schema);
    }

    async validateAdminLogin(data) {
        const schema = Joi.object({
            email: Joi.string().email().required().trim(),
            password: Joi.string().min(8).required().trim(),
        });
        return await this.validate(data, schema);
    }
}

module.exports = new UserValidator();
