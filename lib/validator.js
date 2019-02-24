import Joi from 'joi';
import pathToRegex from 'path-to-regexp';

import {
    VALIDATION_SOURCES,
    BAD_REQUEST,
    RESOURCE_NOT_FOUND,
    DEFAULT_CONFIG_OBJ,
    INVALID_URL_ERROR_MESSAGE,
    INVALID_REQUEST_FORMAT_ERROR_MESSAGE,
    HTTP_METHODS,
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

        this.PATH_REGEX_MAP = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
        };
        this.pathToRegexConverter(this.configObj, this.PATH_REGEX_MAP);
    }

    /**
     * init validator middleware
     * @return {function} validate - validate function
     */
    init() {
        return this.validate.bind(this);
    }

    /**
     * select relevant url using path-regexp
     * @param {object} req - request
     * @return {string} - relevant path
     */
    pathSelector(req) {
        const { url, method } = req;
        const regexes = Object.keys(this.PATH_REGEX_MAP[method] || {});
        let i = 0,
            pathSelected = false;
        while (!pathSelected && i < regexes.length) {
            pathSelected = this.PATH_REGEX_MAP[method][regexes[i]].regex.test(url);
            i++;
        }
        return pathSelected ? this.PATH_REGEX_MAP[method][regexes[i - 1]].path : undefined;
    }

    /**
     * convert given urls to regex
     */
    pathToRegexConverter() {
        HTTP_METHODS.forEach(method => {
            Object.keys(this.configObj.specs[method]).forEach(path => {
                const regex = pathToRegex(path);
                this.PATH_REGEX_MAP[method][regex] = {
                    path,
                    regex,
                };
            });
        });
    }

    /**
     * decorate Joi errors in readable way
     * @param {object} error - Joi error
     * @param {string} source - validation source
     * @return {object} - parsed error
     */
    decorateJoiError(error, source) {
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
     * decorate generic errors in readable way
     * @param {object} error - generic error
     * @return {object} - parsed error
     */
    decorateGenericError(error) {
        return {
            description: error.message,
            errors: [],
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
        const { method, url } = req;
        if (!method || !url) {
            return this.handleValidationFailures(
                this.decorateGenericError(new Error(INVALID_REQUEST_FORMAT_ERROR_MESSAGE)),
                res,
                next,
                BAD_REQUEST
            );
        }

        const path = this.pathSelector(req);

        const schemas = this.configObj.specs[method][path];
        if (schemas) {
            for (let source in VALIDATION_SOURCES) {
                if (schemas[source]) {
                    const { error } = Joi.validate(
                        req[VALIDATION_SOURCES[source]],
                        schemas[source],
                        {
                            abortEarly: false,
                        }
                    );
                    if (error) {
                        const err = this.decorateJoiError(error, source);
                        return this.handleValidationFailures(err, res, next, BAD_REQUEST);
                    }
                }
            }
            return next();
        } else if (this.configObj.allowUndefinedPaths) {
            return next();
        }
        return this.handleValidationFailures(
            this.decorateGenericError(new Error(INVALID_URL_ERROR_MESSAGE)),
            res,
            next,
            RESOURCE_NOT_FOUND
        );
    }
}
