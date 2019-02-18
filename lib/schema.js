import Joi from 'joi';

export const CONFIG_OBJ_SCHEMA = Joi.object().keys({
    allowUndefinedPaths: Joi.boolean().default(true),
    sendErrorResponse: Joi.boolean().default(false),
    specs: Joi.object()
        .keys({
            GET: Joi.object().default({}),
            POST: Joi.object().default({}),
            PUT: Joi.object().default({}),
            DELETE: Joi.object().default({}),
        })
        .default({
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
        }),
});
