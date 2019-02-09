import Joi from 'joi';
import pathToRegex from 'path-to-regexp';

//import configObj from './config';


const PATH_REGEX_MAP = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {}
};

const querySchema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    access_token: [Joi.string(), Joi.number()],
    birthyear: Joi.number().integer().min(1900).max(2013).required(),
    email: Joi.string().email({minDomainAtoms: 2})
});
const pathSchema = Joi.object().keys({
   id: Joi.number().min(0).required()
});

const configObj = {
    "GET": {
        "/user/:id": {
            "path": {},
            "query": {},
            "body": {}
        },
        "/user/:id/info": {
            "path": pathSchema,
            "query": querySchema,
        }
    },
    "POST": {
        "/user/:id/age": {
            "path": {},
            "query": {},
            "body": {}
        },
        "/user/:id/:someID/book": {
            "path": {},
            "query": {},
            "body": {}
        }
    }
};

const errorParser = function (error) {
    const {name, details} = error;
    const errors = details.map(({message, path, context}) => {
        return {
            message,
            path,
            context
        }
    });
    return {
        name,
        errors
    };
};

const pathSelector = function (req, pathRegexMap) {
    const {url, path, method} = req;
    const regexes = Object.keys(pathRegexMap[method]);
    let i = 0, pathSelected = false;
    while (!pathSelected && i < regexes.length) {
        pathSelected = PATH_REGEX_MAP[method][regexes[i]].regex.test(url);
        i++;
    }
    console.log(`path: ${PATH_REGEX_MAP[method][regexes[i - 1]].path}`);
    return PATH_REGEX_MAP[method][regexes[i - 1]].path;
};

const pathToRegexConverter = function (configObj, pathRegexMap) {
    const methods = ["GET", "POST", "PUT", "DELETE"];
    methods.forEach((method) => {
        if (configObj[method]) {
            Object.keys(configObj[method]).forEach((path) => {
                const regex = pathToRegex(path);
                pathRegexMap[method][regex] = {
                    path,
                    regex
                };
            });
        }
    })
};

const validate = function (req, callback) {
    const {url, method} = req;
    const validationIndexes = ["path", "query", "body"];
    const path = pathSelector(request, PATH_REGEX_MAP);
    if (path) {
        const schemas = configObj[method][path];
        validationIndexes.forEach((index) => {
            if(schemas[index]) {
                const {error} = Joi.validate(req[index], schemas[index], {
                    abortEarly: false
                });
                if (error) {
                    console.log(JSON.stringify(error));
                    console.log(JSON.stringify(errorParser(error)));
                }
            } else { // override anything validator is not aware of
                req[index] = {};
            }
        });
    } else {
        console.log(`unknown path: ${url}`)
    }
};


//TEST
const req = {
    username: "asanka",
    password: "1222cd",
    access_token: "xxxxxxxxxx",
    birthyear: 1992,
    email: "33tth@gmail.com"
};
const request = {
    url: '/user/1/infoss/',
    method: 'GET',
    path: {
        id: 1,
    },
    query: {
        name: true,
        age: true
    },
};

pathToRegexConverter(configObj, PATH_REGEX_MAP);
validate(request);


/*
test cases
1. unknown routes
2. path params
3. query params
4. body params
5. GET requests
6. POST requests
7. PUT requests
8. DELETE requests
*/
