import Joi from 'joi';

import { VALIDATION_SOURCES } from './constants';

/**
 * Validator middleware
 */
class Validator {
    /**
     * initialize validator with provided configs
     * @param {Object} configObj - global and route specific configs
     * @return {Validator.validate} -
     */
    init(configObj) {
        // TODO: validate config obj schema
        this.configObj = configObj;
        return this.validate.bind(this);
    }

    /**
     * decorate Joi errors in readable way
     * @param {object} error - Joi error
     * @param {string} source - validation source
     * @return {object} - parsed error
     * @private
     */
    decorateError(error, source) {
        const { details = [] } = error;
        const errors = details.map(({ message, path, context }) => ({
            message,
            path,
            context,
        }));
        return {
            description: `request ${source} params validation failed`,
            errors,
        };
    }

    /**
     * final req validation happens here
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next middleware tick
     * @return {*} -
     * @private
     */
    validate(req, res, next) {
        const {
            method,
            route: { path },
        } = req;
        if (path) {
            const schemas = this.configObj[method][path];
            for (let index = 0; index < VALIDATION_SOURCES.length; index++) {
                if (schemas[VALIDATION_SOURCES[index]]) {
                    const { error } = Joi.validate(
                        req[VALIDATION_SOURCES[index]],
                        schemas[VALIDATION_SOURCES[index]],
                        {
                            abortEarly: false,
                        }
                    );
                    if (error) {
                        //console.log(JSON.stringify(error));
                        const err = this.decorateError(
                            error,
                            VALIDATION_SOURCES[index]
                        );
                        //console.log(JSON.stringify(err));
                        return next(err);
                        //return this._responseWithError(error, 400, res);
                    }
                }
            }
            return next();
        }
        const error = new Error('Invalid URL');
        //this._responseWithError(error, 404, res);
        return next(error);
    }

    /**
     * send response with given error n status
     * @param {object} err - error
     * @param {number} status - response status
     * @param {object} res - response
     * @private
     */
    responseWithError(err, status, res) {
        res.status(status).json({
            error: true,
            data: err,
        });
    }
}

export default new Validator();
