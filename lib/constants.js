export const HEADER = 'header';
export const QUERY = 'query';
export const PATH = 'path';
export const BODY = 'body';

export const BAD_REQUEST = 400;
export const RESOURCE_NOT_FOUND = 404;

export const INVALID_URL_ERROR_MESSAGE = 'Invalid URL';
export const INVALID_REQUEST_FORMAT_ERROR_MESSAGE = 'Invalid Request Format';

export const VALIDATION_SOURCES = [HEADER, PATH, QUERY, BODY];

export const DEFAULT_CONFIG_OBJ = {
    allowUndefinedPaths: true,
    sendErrorResponse: false,
    specs: {
        GET: {},
        POST: {},
        PUT: {},
        DELETE: {},
    },
};
