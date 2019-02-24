/* eslint-disable no-magic-numbers */
/* eslint-disable no-useless-escape */
import Joi from 'joi';

export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';
export const DELETE = 'DELETE';

export const USER_ID_PATH_PATTERN = '/user/:id';

export const USER_ID_URL = '/user/1';
export const USER_INFO_URL = '/user/1/info';
export const USER_FRIENDS_URL = '/user/1/friends';
export const USER_URL = '/user';
export const USER_AUTHENTICATE_URL = '/user/authenticate';
export const UNDEFINED_URL = '/unknow/path';

const USER_ID_PATH = Joi.object().keys({
    id: Joi.number()
        .min(0)
        .required(),
});

const GET_USER_HEADER = Joi.object().keys({
    accessToken: Joi.string()
        .token()
        .min(25)
        .max(25)
        .required(),
    refreshToken: Joi.string()
        .token()
        .min(25)
        .max(25)
        .required(),
});

const POST_USER_BODY = Joi.object().keys({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(25)
        .required(),
    password: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
    birthyear: Joi.number()
        .integer()
        .min(1900)
        .max(2013)
        .required(),
    email: Joi.string().email({ minDomainAtoms: 2 }),
});

const PUT_USER_BODY = Joi.object().keys({
    age: Joi.number()
        .min(20)
        .required(),
    interests: Joi.array()
        .items(Joi.string())
        .required(),
    email: Joi.string().email({ minDomainAtoms: 2 }),
});

const GET_USER_FRIEND_QUERY = Joi.object().keys({
    order: Joi.string()
        .regex(/^(ASC|DESC)/)
        .required(),
    limit: Joi.number().max(10),
});

export const configObj = {
    allowUndefinedPaths: true,
    sendErrorResponse: false,
    specs: {
        GET: {
            '/user/authenticate': {
                header: GET_USER_HEADER,
            },
            '/user/:id': {
                path: USER_ID_PATH,
            },
            '/user/:id/friends': {
                path: USER_ID_PATH,
                query: GET_USER_FRIEND_QUERY,
            },
        },
        POST: {
            '/user': {
                body: POST_USER_BODY,
            },
            '/user/:id/info': {
                path: USER_ID_PATH,
            },
        },
        PUT: {
            '/user/:id': {
                path: USER_ID_PATH,
                body: PUT_USER_BODY,
            },
        },
        DELETE: {
            '/user/:id': {
                path: USER_ID_PATH,
            },
        },
    },
};

export const joiError = {
    isJoi: true,
    name: 'ValidationError',
    details: [
        {
            message: '"username" is required',
            path: ['username'],
            type: 'any.required',
            context: {
                key: 'username',
                label: 'username',
            },
        },
        {
            message: '"birthyear" is required',
            path: ['birthyear'],
            type: 'any.required',
            context: {
                key: 'birthyear',
                label: 'birthyear',
            },
        },
        {
            message: '"name" is not allowed',
            path: ['name'],
            type: 'object.allowUnknown',
            context: {
                child: 'name',
                value: true,
                key: 'name',
                label: 'name',
            },
        },
        {
            message: '"age" is not allowed',
            path: ['age'],
            type: 'object.allowUnknown',
            context: {
                child: 'age',
                value: true,
                key: 'age',
                label: 'age',
            },
        },
    ],
    _object: {
        name: true,
        age: true,
    },
};

export const libErrorOne = {
    description: 'request body params validation failed',
    errors: [
        {
            message: '"username" is required',
            path: ['username'],
            context: {
                key: 'username',
                label: 'username',
            },
        },
        {
            message: '"birthyear" is required',
            path: ['birthyear'],
            context: {
                key: 'birthyear',
                label: 'birthyear',
            },
        },
        {
            message: '"name" is not allowed',
            path: ['name'],
            context: {
                child: 'name',
                value: true,
                key: 'name',
                label: 'name',
            },
        },
        {
            message: '"age" is not allowed',
            path: ['age'],
            context: {
                child: 'age',
                value: true,
                key: 'age',
                label: 'age',
            },
        },
    ],
};

export const libErrorTwo = {
    description: 'request header params validation failed',
    errors: [],
};

export const responseError = {
    data: {
        description: 'request body params validation failed',
        errors: [
            {
                context: {
                    key: 'username',
                    label: 'username',
                },
                message: '"username" is required',
                path: ['username'],
            },
            {
                context: {
                    key: 'birthyear',
                    label: 'birthyear',
                },
                message: '"birthyear" is required',
                path: ['birthyear'],
            },
            {
                context: {
                    child: 'name',
                    key: 'name',
                    label: 'name',
                    value: true,
                },
                message: '"name" is not allowed',
                path: ['name'],
            },
            {
                context: {
                    child: 'age',
                    key: 'age',
                    label: 'age',
                    value: true,
                },
                message: '"age" is not allowed',
                path: ['age'],
            },
        ],
    },
    error: true,
};

export const headerValidationError = {
    description: 'request header params validation failed',
    errors: [
        {
            message: '"accessToken" is required',
            path: ['accessToken'],
            context: {
                key: 'accessToken',
                label: 'accessToken',
            },
        },
        {
            message: '"refreshToken" is required',
            path: ['refreshToken'],
            context: {
                key: 'refreshToken',
                label: 'refreshToken',
            },
        },
    ],
};

export const pathValidationError = {
    description: 'request path params validation failed',
    errors: [
        {
            message: '"id" must be a number',
            path: ['id'],
            context: {
                value: 'xyz',
                key: 'id',
                label: 'id',
            },
        },
    ],
};

export const queryValidationError = {
    description: 'request query params validation failed',
    errors: [
        {
            message:
                '"order" with value "Ascending" fails to match the required pattern: /^(ASC|DESC)/',
            path: ['order'],
            context: {
                name: undefined,
                pattern: /^(ASC|DESC)/,
                value: 'Ascending',
                key: 'order',
                label: 'order',
            },
        },
        {
            message: '"limit" must be less than or equal to 10',
            path: ['limit'],
            context: {
                limit: 10,
                value: 25,
                key: 'limit',
                label: 'limit',
            },
        },
    ],
};

export const bodyValidationError = {
    description: 'request body params validation failed',
    errors: [
        {
            message: '"username" must only contain alpha-numeric characters',
            path: ['username'],
            context: {
                value: 'John Doe',
                key: 'username',
                label: 'username',
            },
        },
        {
            message: '"password" is required',
            path: ['password'],
            context: {
                key: 'password',
                label: 'password',
            },
        },
        {
            message: '"birthyear" is required',
            path: ['birthyear'],
            context: {
                key: 'birthyear',
                label: 'birthyear',
            },
        },
    ],
};

export const PATH_REGEX_MAP = {
    GET: {
        '/^\\/user\\/authenticate(?:\\/)?$/i': {
            path: '/user/authenticate',
            regex: /^\/user\/authenticate(?:\/)?$/i,
        },
        '/^\\/user\\/([^\\/]+?)(?:\\/)?$/i': {
            path: '/user/:id',
            regex: /^\/user\/([^\/]+?)(?:\/)?$/i,
        },
        '/^\\/user\\/([^\\/]+?)\\/friends(?:\\/)?$/i': {
            path: '/user/:id/friends',
            regex: /^\/user\/([^\/]+?)\/friends(?:\/)?$/i,
        },
    },
    POST: {
        '/^\\/user(?:\\/)?$/i': {
            path: '/user',
            regex: /^\/user(?:\/)?$/i,
        },
        '/^\\/user\\/([^\\/]+?)\\/info(?:\\/)?$/i': {
            path: '/user/:id/info',
            regex: /^\/user\/([^\/]+?)\/info(?:\/)?$/i,
        },
    },
    PUT: {
        '/^\\/user\\/([^\\/]+?)(?:\\/)?$/i': {
            path: '/user/:id',
            regex: /^\/user\/([^\/]+?)(?:\/)?$/i,
        },
    },
    DELETE: {
        '/^\\/user\\/([^\\/]+?)(?:\\/)?$/i': {
            path: '/user/:id',
            regex: /^\/user\/([^\/]+?)(?:\/)?$/i,
        },
    },
};

export const DECORATED_INVALID_URL_ERROR = {
    description: 'Invalid URL',
    errors: [],
};

export const DECORATED_INVALID_REQ_FORMAT_ERROR = {
    description: 'Invalid Request Format',
    errors: [],
};

export const createRequest = ({
    url,
    method = GET,
    params = {},
    query = {},
    body = {},
    header = {},
}) => ({
    url,
    method,
    header,
    params,
    query,
    body,
});
