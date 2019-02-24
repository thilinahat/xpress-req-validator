import Validator from '../validator';
import {
    GET,
    POST,
    DELETE,
    PUT,
    USER_ID_PATH_PATTERN,
    configObj,
    createRequest,
    joiError,
    libErrorOne,
    libErrorTwo,
    responseError,
    headerValidationError,
    pathValidationError,
    queryValidationError,
    bodyValidationError,
    PATH_REGEX_MAP,
    DECORATED_INVALID_URL_ERROR,
    DECORATED_INVALID_REQ_FORMAT_ERROR,
    USER_ID_URL,
    USER_INFO_URL,
    USER_FRIENDS_URL,
    USER_AUTHENTICATE_URL,
    USER_URL,
    UNDEFINED_URL
} from './mockdata';
import {
    HEADER,
    BODY,
    BAD_REQUEST,
    RESOURCE_NOT_FOUND,
    DEFAULT_CONFIG_OBJ,
    INVALID_URL_ERROR_MESSAGE,
} from '../constants';

describe('unit tests for validator module', () => {
    describe('unit test suites for constructor()', () => {
        test('set passed config object as a class variable', () => {
            const validator = new Validator(configObj);
            expect(validator.configObj).toEqual(configObj);
        });
        test('set default values to config object if not passed', () => {
            const validator = new Validator({
                ...configObj,
                allowUndefinedPaths: undefined,
                sendErrorResponse: undefined,
            });
            expect(validator.configObj).toEqual({
                ...configObj,
                allowUndefinedPaths: true,
                sendErrorResponse: false,
            });
        });
        test('set default config object if invalid object passed', () => {
            const validator = new Validator({ specs: [] });
            expect(validator.configObj).toEqual(DEFAULT_CONFIG_OBJ);
        });
        test('produce path-regex-map using passed config object', () => {
            const validator = new Validator(configObj);
            validator.pathToRegexConverter = jest.fn().mockReturnValue(PATH_REGEX_MAP);
            expect(validator.PATH_REGEX_MAP).toEqual(PATH_REGEX_MAP);
        });
    });

    describe('unit test suites for init()', () => {
        test('closure returns a function as expected ', () => {
            const validator = new Validator(configObj);
            expect(typeof validator.init()).toBe('function');
        });
    });

    describe('unit test suites for pathToRegexConverter()', () => {
        test('coverts paths to regex as expected', () => {
            const validator = new Validator(configObj);
            expect(validator.PATH_REGEX_MAP).toEqual(PATH_REGEX_MAP);
        });
    });

    describe('unit test suites for pathSelector()', () => {
        test('identifies defined paths as expected', () => {
            const validator = new Validator(configObj);
            const req = createRequest({
                url: USER_ID_URL,
            });
            expect(validator.pathSelector(req)).toEqual(USER_ID_PATH_PATTERN);
        });
        test('identifies undefined paths as expected', () => {
            const validator = new Validator(configObj);
            const req = createRequest({
                url: UNDEFINED_URL,
            });
            expect(validator.pathSelector(req)).toBe(undefined);
        });
        test('identifies undefined methods as expected', () => {
            const validator = new Validator(configObj);
            const req = createRequest({
                url: USER_ID_URL,
                method: HEADER
            });
            expect(validator.pathSelector(req)).toBe(undefined);
        });
    });

    describe('unit test suites for decorateJoiError()', () => {
        let validator;
        beforeEach(() => {
            validator = new Validator(configObj);
        });
        test('handles Joi errors as expected', () => {
            expect(validator.decorateJoiError(joiError, BODY)).toEqual(libErrorOne);
        });
        test('handles non Joi errors as expected', () => {
            expect(validator.decorateJoiError({}, HEADER)).toEqual(libErrorTwo);
        });
    });

    describe('unit test suites for decorateGenericError()', () => {
        let validator;
        beforeEach(() => {
            validator = new Validator({});
        });
        test('decorate generic errors as expected', () => {
            expect(validator.decorateGenericError(new Error(INVALID_URL_ERROR_MESSAGE))).toEqual(
                DECORATED_INVALID_URL_ERROR
            );
        });
    });

    describe('unit test suites for responseWithError()', () => {
        let validator,
            res,
            json = jest.fn(),
            status = jest.fn().mockReturnValue({ json });
        beforeEach(() => {
            validator = new Validator(configObj);
            res = {
                status,
            };
        });

        test('response successfully with given error and status', () => {
            validator.responseWithError(libErrorOne, BAD_REQUEST, res);
            expect(status).toHaveBeenCalledTimes(1);
            expect(status).toHaveBeenCalledWith(BAD_REQUEST);
            expect(json).toHaveBeenCalledTimes(1);
            expect(json).toHaveBeenCalledWith(responseError);
        });
    });

    describe('unit test suites for handleValidationFailures()', () => {
        test('send error response on validation failures if configured properly', () => {
            const validator = new Validator({
                    ...configObj,
                    sendErrorResponse: true,
                }),
                next = jest.fn(),
                err = new Error(INVALID_URL_ERROR_MESSAGE),
                res = Object;
            validator.responseWithError = jest.fn();
            validator.handleValidationFailures(err, res, next, RESOURCE_NOT_FOUND);
            expect(next).toHaveBeenCalledTimes(0);
            expect(validator.responseWithError).toHaveBeenCalledTimes(1);
            expect(validator.responseWithError).toHaveBeenCalledWith(err, RESOURCE_NOT_FOUND, res);
        });
        test('call next on validation failures if configured properly', () => {
            const validator = new Validator(configObj),
                next = jest.fn(),
                err = new Error(INVALID_URL_ERROR_MESSAGE),
                res = Object;
            validator.responseWithError = jest.fn();
            validator.handleValidationFailures(err, res, next, RESOURCE_NOT_FOUND);
            expect(validator.responseWithError).toHaveBeenCalledTimes(0);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('unit test suites for validate()', () => {
        let validator,
            validate,
            next,
            res = Object;
        beforeEach(() => {
            validator = new Validator(configObj);
            validate = validator.init();
            validator.handleValidationFailures = jest.fn();
            next = jest.fn();
        });

        test('identify undefined urls as expected and allow them if configured', () => {
            validate(
                createRequest({
                    url: UNDEFINED_URL,
                }),
                res,
                next
            );
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
        test('identify undefined urls as expected and send error response if configured', () => {
            validator = new Validator({
                ...configObj,
                sendErrorResponse: true,
                allowUndefinedPaths: false,
            });
            validate = validator.init();
            validator.responseWithError = jest.fn();
            validate(
                createRequest({
                    url: UNDEFINED_URL,
                }),
                res,
                next
            );
            expect(next).toHaveBeenCalledTimes(0);
            expect(validator.responseWithError).toHaveBeenCalledTimes(1);
            expect(validator.responseWithError).toHaveBeenCalledWith(
                DECORATED_INVALID_URL_ERROR,
                RESOURCE_NOT_FOUND,
                res
            );
        });
        test('identify undefined urls as expected and callback next middleware with error if configured', () => {
            validator = new Validator({
                ...configObj,
                sendErrorResponse: false,
                allowUndefinedPaths: false,
            });
            validate = validator.init();
            validate(
                createRequest({
                    url: UNDEFINED_URL,
                }),
                res,
                next
            );
            validator.responseWithError = jest.fn();
            expect(next).toHaveBeenCalledTimes(1);
            expect(validator.responseWithError).toHaveBeenCalledTimes(0);
            expect(next).toHaveBeenCalledWith(DECORATED_INVALID_URL_ERROR);
        });
        test('identify invalid request formats as expected', () => {
            const req = createRequest({});
            validate(req, res, next);
            expect(validator.handleValidationFailures).toHaveBeenCalledTimes(1);
            expect(validator.handleValidationFailures).toHaveBeenCalledWith(
                DECORATED_INVALID_REQ_FORMAT_ERROR,
                res,
                next,
                BAD_REQUEST
            );
        });
        test('identify request header validation failures as expected', () => {
            const req = createRequest({
                method: GET,
                url: USER_AUTHENTICATE_URL,
            });
            validate(req, res, next);
            expect(validator.handleValidationFailures).toHaveBeenCalledTimes(1);
            expect(validator.handleValidationFailures).toHaveBeenCalledWith(
                headerValidationError,
                res,
                next,
                BAD_REQUEST
            );
        });
        test('identify request path validation failures as expected', () => {
            const req = createRequest({
                method: POST,
                url: USER_INFO_URL,
                params: {
                    id: 'xyz',
                },
            });
            validate(req, res, next);
            //expect(validator.handleValidationFailures).toHaveBeenCalledTimes(1);
            expect(validator.handleValidationFailures).toHaveBeenCalledWith(
                pathValidationError,
                res,
                next,
                BAD_REQUEST
            );
        });
        test('identify request query validation failures as expected', () => {
            const req = createRequest({
                method: GET,
                url: USER_FRIENDS_URL,
                params: {
                    id: 1,
                },
                query: {
                    order: 'Ascending',
                    limit: 25,
                },
            });
            validate(req, res, next);
            expect(validator.handleValidationFailures).toHaveBeenCalledTimes(1);
            expect(validator.handleValidationFailures).toHaveBeenCalledWith(
                queryValidationError,
                res,
                next,
                BAD_REQUEST
            );
        });
        test('identify request body validation failures as expected', () => {
            const req = createRequest({
                method: POST,
                url: USER_URL,
                params: {
                    id: 1,
                },
                body: {
                    username: 'John Doe',
                },
            });
            validate(req, res, next);
            expect(validator.handleValidationFailures).toHaveBeenCalledTimes(1);
            expect(validator.handleValidationFailures).toHaveBeenCalledWith(
                bodyValidationError,
                res,
                next,
                BAD_REQUEST
            );
        });
        test('identify request header validation success as expected', () => {
            const req = createRequest({
                method: GET,
                url: USER_AUTHENTICATE_URL,
                header: {
                    accessToken: 'xyzabc123qjdkslo9db3jdAAM',
                    refreshToken: 'IDM267493001sjdthwncooZZZ',
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
        test('identify request path validation success as expected', () => {
            const req = createRequest({
                method: DELETE,
                url: USER_ID_URL,
                params: {
                    id: 1,
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
        test('identify request query validation success as expected', () => {
            const req = createRequest({
                method: PUT,
                url: USER_ID_URL,
                params: {
                    id: 1,
                },
                body: {
                    age: 25,
                    interests: ['soccer', 'rugby', 'trolling'],
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
        test('identify request body validation success as expected', () => {
            const req = createRequest({
                method: POST,
                url: USER_URL,
                body: {
                    username: 'johnDoe',
                    password: 'xydnqjhd',
                    birthyear: 2000,
                },
            });
            validate(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
    });
});
