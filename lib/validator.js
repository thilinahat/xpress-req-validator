import Joi from 'joi';

import {
    VALIDATION_SOURCES,
    BAD_REQUEST,
    RESOURCE_NOT_FOUND,
    DEFAULT_CONFIG_OBJ,
    INVALID_URL_ERROR_MESSAGE,
    INVALID_REQUEST_FORMAT_ERROR_MESSAGE,
} from './constants';
import { CONFIG_OBJ_SCHEMA } from './schema';

/**
 * Validator middleware
 */
export default class Validator {
    /**
     * initialize validator with provided configs
     * @param {Object} configObj - global and route specific configs
     */
    constructor(configObj) {
        const { value, error } = Joi.validate(configObj, CONFIG_OBJ_SCHEMA);
        if (error) {
            this.configObj = DEFAULT_CONFIG_OBJ;
        } else {
            this.configObj = value;
        }
    }

    /**
     * init validator middleware
     * @return {function} validate - validate function
     */
    init() {
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

    /**
     * execute expected validation failure handling mechanism as configured
     * @param {object} err - validation error
     * @param {object} res - response object
     * @param {function} next - pointer to next middleware
     * @param {number} statusCode - relevant http error code
     * @return {*} -
     */
    handleValidationFailures(err, res, next, statusCode) {
        if (this.configObj.sendErrorResponse) {
            return this.responseWithError(err, statusCode, res);
        }
        return next(err);
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

        if (!method || !path) {
            return this.handleValidationFailures(
                new Error(INVALID_REQUEST_FORMAT_ERROR_MESSAGE),
                res,
                next,
                BAD_REQUEST
            );
        }

        const schemas = this.configObj.specs[method][path];
        if (schemas) {
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
                        const err = this.decorateError(error, VALIDATION_SOURCES[index]);
                        this.handleValidationFailures(err, res, next, BAD_REQUEST);
                    }
                }
            }
            return next();
        } else if (this.configObj.allowUndefinedPaths) {
            return next();
        }
        this.handleValidationFailures(
            new Error(INVALID_URL_ERROR_MESSAGE),
            res,
            next,
            RESOURCE_NOT_FOUND
        );
    }
}
