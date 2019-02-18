import Validator from '../validator';
import {
    GET,
    POST,
    DELETE,
    PUT,
    USER_AUTHENTICATE_PATH_PATTERN,
    USER_ID_PATH_PATTERN,
    USER_INFO_PATH_PATTERN,
    USER_FRIENDS_PATH_PATTERN,
    USER_PATH_PATTERN,
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
    UNDEFINED_PATH_PATTERN,
} from './mockdata';
import {
    HEADER,
    BODY,
    BAD_REQUEST,
    RESOURCE_NOT_FOUND,
    DEFAULT_CONFIG_OBJ,
    INVALID_URL_ERROR_MESSAGE,
    INVALID_REQUEST_FORMAT_ERROR_MESSAGE,
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
    });

    describe('unit test suites for init()', () => {
        test('closure returns a function as expected ', () => {
            const validator = new Validator(configObj);
            expect(typeof validator.init()).toBe('function');
        });
    });

    describe('unit test suites for decorateError()', () => {
        let validator;
        beforeEach(() => {
            validator = new Validator(configObj);
        });
        test('handles Joi errors as expected', () => {
            expect(validator.decorateError(joiError, BODY)).toEqual(libErrorOne);
        });
        test('handles non Joi errors as expected', () => {
            expect(validator.decorateError({}, HEADER)).toEqual(libErrorTwo);
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
                    pathPattern: UNDEFINED_PATH_PATTERN,
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
                    pathPattern: UNDEFINED_PATH_PATTERN,
                }),
                res,
                next
            );
            expect(next).toHaveBeenCalledTimes(0);
            expect(validator.responseWithError).toHaveBeenCalledTimes(1);
            expect(validator.responseWithError).toHaveBeenCalledWith(
                new Error(INVALID_URL_ERROR_MESSAGE),
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
                    pathPattern: UNDEFINED_PATH_PATTERN,
                }),
                res,
                next
            );
            validator.responseWithError = jest.fn();
            expect(next).toHaveBeenCalledTimes(1);
            expect(validator.responseWithError).toHaveBeenCalledTimes(0);
            expect(next).toHaveBeenCalledWith(new Error(INVALID_URL_ERROR_MESSAGE));
        });
        test('identify invalid request formats as expected', () => {
            const req = createRequest({});
            validate(req, res, next);
            expect(validator.handleValidationFailures).toHaveBeenCalledTimes(1);
            expect(validator.handleValidationFailures).toHaveBeenCalledWith(
                new Error(INVALID_REQUEST_FORMAT_ERROR_MESSAGE),
                res,
                next,
                BAD_REQUEST
            );
        });
        test('identify request header validation failures as expected', () => {
            const req = createRequest({
                method: GET,
                pathPattern: USER_AUTHENTICATE_PATH_PATTERN,
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
                pathPattern: USER_INFO_PATH_PATTERN,
                path: {
                    id: 'xyz',
                },
            });
            validate(req, res, next);
            expect(validator.handleValidationFailures).toHaveBeenCalledTimes(1);
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
                pathPattern: USER_FRIENDS_PATH_PATTERN,
                path: {
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
                pathPattern: USER_PATH_PATTERN,
                path: {
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
                pathPattern: USER_AUTHENTICATE_PATH_PATTERN,
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
                pathPattern: USER_ID_PATH_PATTERN,
                path: {
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
                pathPattern: USER_ID_PATH_PATTERN,
                path: {
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
                pathPattern: USER_PATH_PATTERN,
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
