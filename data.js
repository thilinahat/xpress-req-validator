import Joi from 'joi';


const querySchema = Joi.object().keys({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    access_token: [Joi.string(), Joi.number()],
    birthyear: Joi.number()
        .integer()
        .min(1900)
        .max(2013)
        .required(),
    email: Joi.string().email({ minDomainAtoms: 2 }),
});
const pathSchema = Joi.object().keys({
    id: Joi.number()
        .min(0)
        .required(),
});

const configObj = {
    GET: {
        '/user/:id': {
            path: {},
            query: {},
            body: {},
        },
        '/user/:id/info': {
            path: pathSchema,
            query: querySchema,
        },
    },
    POST: {
        '/user/:id/age': {
            path: {},
            query: {},
            body: {},
        },
        '/user/:id/:someID/book': {
            path: {},
            query: {},
            body: {},
        },
    },
};

//TEST
const request = {
    url: '/user/1/infoss/',
    method: 'GET',
    path: {
        id: 1,
    },
    query: {
        name: true,
        age: true,
    },
};


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
