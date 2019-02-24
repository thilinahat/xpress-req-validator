# [LOGO] Request Validator

Hassle free middleware to validate all type of requests in a single place while respecting the principle of separation of concerns

[![npm version](https://img.shields.io/badge/npm-v1.0.0-red.svg)](https://www.npmjs.com/package/xpress-req-validator)
[![Build Status](https://travis-ci.org/IamThilina/xpress-req-validator.svg?branch=master)](https://travis-ci.org/IamThilina/xpress-req-validator)
[![Coverage Status](https://coveralls.io/repos/github/IamThilina/xpress-req-validator/badge.svg?branch=master)](https://coveralls.io/github/IamThilina/xpress-req-validator?branch=master)
[![Code Climate](https://codeclimate.com/github/IamThilina/xpress-req-validator/badges/gpa.svg)](https://codeclimate.com/github/IamThilina/xpress-req-validator)
[![Known Vulnerabilities](https://snyk.io/test/github/IamThilina/xpress-req-validator/badge.svg?targetFile=package.json)](https://snyk.io/test/github/IamThilina/xpress-req-validator?targetFile=package.json)
<a href="#badge">
<img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square">
</a>
<a href="#badge">
<img alt="linter: eslint" src="https://img.shields.io/badge/linter-eslint-9cf.svg">
</a>
## Introduction

`xpress-req-validator` allows developers to handle all request validation tasks in a single place as a middleware while respecting the principle of separation of concerns.
It can be used at app level or router level.
`xpress-req-validator` relies on [Joi](https://github.com/hapijs/joi) (the awsome JSON Schema validator), which is used to define the request validation specs

## Table of Contents

-   [Why xpress-req-validator](#why-xpress-req-validator)
-   [Installation](#installation)
-   [Basic Usage](#basic-usage)
-   [Extended Documentation](#extended-documentation)
-   [Changelog](#changelog)
-   [License](#license)

### Why xpress-req-validator

Request validation is a must when developing an API. Express allows following means to achieve this.

1. Handling validation logic in each route handler (method-1)

```node
router.post('/device/data', (req, res) => {
        const {deviceID, serialNo} = req.body;
        if(!deviceID || !serialNo) {
            const err = new Error('invalid parameters')
            res.status(400).json({err})
        }

        controller(req.body) // controller section
}
```

2. writing a separate middleware in each route handler (method-2)

```node
router.post('/device/data', deviceDataValidationMiddleware, (req, res) => {
        controller(req.body) // controller section
}
```

Method-1 is an ugly and painful way of achieving request validation. Method-2 is comparatively better, but still requires you to write a ton of middleware.
Both methods demand a significant effort to unit test the route handler.

There has to be a better way of validating requests with less unit testing effort and of course by separating the concerns. `xpress-req-validator` is the solution.
It allows developers to define all their request validation specs in a single place, make route handling code snippets much cleaner and finally reducing the unit test effort

### Installation

```node
yarn add xpress-req-validator
```

or

```node
npm install xpress-req-validator
```

### Basic Usage

Assume that we need to validate the request body of `deviceRouter.post('/device', ()=> {})`

> first we must define the validation spec for request body using Joi

`spec.js`
```node
import Joi from 'joi';

export const DEVICE_SPEC = Joi.object().keys({
    serialNo: Joi.string()
        .alphanum()
        .min(3)
        .max(25)
        .required(),
    manufacturedYear: Joi.number()
        .integer()
        .min(1900)
        .required(),
    type: Joi.string()
        .valid(['TYPE-A','TYPE-B'])
        .required(),
});
```

> next we must define the `xpress-req-validator` configurations

`config.js`
```node
import {DEVICE_SPEC} from './spec';

export default {
    specs: {
        POST: {
            '/device': {
                body: DEVICE_SPEC,
            },
        },
    },
};
```

> now we can apply the `xpress-req-validator` to `deviceRouter`

`deviceRouter.js`
```node
import express from 'express';
import Validator from 'xpress-req-validator';

import config from './config';

const validator = new Validator(config);
const deviceRouter = express.Router();
deviceRouter.use(validator.init());

deviceRouter.post('/device', ()=> {});
```

> That's how easy and clean `xpress-req-validator` does the job for you. Similarly we can validate the `header`, `path` & `query`
of `GET`, `PUT` & `DELETE` requests

### Extended Documentation
For more detailed examples please visit [GitBook](https://iamthilina.gitbook.io/xpress-req-validator/)

### Changelog

### License
MIT
