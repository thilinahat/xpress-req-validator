/* eslint-disable */
import pathToRegex from 'path-to-regexp';
import Joi from 'joi';

/**
 * Validator middleware
 */
class Validator {
    /**
     * initialize validator with provided configs
     * @param {Object} configObj - global and route specific configs
     * @return {Validator._validate} -
     */
    init(configObj) {
        this.PATH_REGEX_MAP = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
        };
        // validate config obj schema
        this.configObj = configObj;
        this._pathToRegexConverter(configObj, this.PATH_REGEX_MAP);
        return this._validate;
    }

    /**
     * select relevant url using path-regexp
     * @param {object} req - request
     * @return {string} - relevant path
     * @private
     */
    _pathSelector(req) {
        const { url, method } = req;
        const regexes = Object.keys(this.PATH_REGEX_MAP[method]);
        let i = 0,
            pathSelected = false;
        while (!pathSelected && i < regexes.length) {
            pathSelected = this.PATH_REGEX_MAP[method][regexes[i]].regex.test(
                url
            );
            i++;
        }
        //console.log(`path: ${this.PATH_REGEX_MAP[method][regexes[i - 1]].path}`);
        return this.PATH_REGEX_MAP[method][regexes[i - 1]].path;
    }

    /**
     * convert given urls to regex
     * @private
     */
    _pathToRegexConverter() {
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        methods.forEach(method => {
            if (this.configObj[method]) {
                Object.keys(this.configObj[method]).forEach(path => {
                    const regex = pathToRegex(path);
                    this.PATH_REGEX_MAP[method][regex] = {
                        path,
                        regex,
                    };
                });
            }
        });
    }

    /**
     * final req validation happens here
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next middleware tick
     * @return {*} -
     * @private
     */
    _validate(req, res, next) {
        const { url, method } = req;
        const validationIndexes = ['path', 'query', 'body'];
        const path = this._pathSelector(req);
        if (path) {
            const schemas = this.configObj[method][path];
            for (let index = 0; index < validationIndexes.length; index++) {
                if (schemas[validationIndexes[index]]) {
                    const { error } = Joi.validate(
                        req[validationIndexes[index]],
                        schemas[validationIndexes[index]],
                        {
                            abortEarly: false,
                        }
                    );
                    if (error) {
                        console.log(JSON.stringify(error));
                        console.log(JSON.stringify(this._errorParser(error)));
                        return this._responseWithError(error, 400, res);
                    }
                } else {
                    // override anything validator is not aware of
                    req[validationIndexes[index]] = {};
                }
            }
        } else {
            console.log(`unknown path: ${url}`);
            const error = new Error('invalid url');
            this._responseWithError(error, 404, res);
        }
        return next();
    }

    /**
     * send response with given error n status
     * @param {object} err - error
     * @param {number} status - response status
     * @param {object} res - response
     * @private
     */
    _responseWithError(err, status, res) {
        res.status(status).json({
            error: true,
            data: err,
        });
    }

    /**
     * parse Joi errors in readable way
     * @param {object} error - Joi error
     * @return {object} - parsed error
     * @private
     */
    _errorParser(error) {
        const { name, details } = error;
        const errors = details.map(({ message, path, context }) => ({
            message,
            path,
            context,
        }));
        return {
            name,
            errors,
        };
    }
}

export default new Validator();
