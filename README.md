# [LOGO] Request Validator

Hazzle free middleware to validate all type of requests in a single place as a middleware by respecting the principle of separation of concerns

[npm] [build-sucess] [coverage-100%] [eslint-pass] [vulnerbaility-0]

## Introduction

xpress-req-validator allows developers to handle all request validation tasks in a single place as a middleware by respecting the principle of separation of concerns.
It can be used at app level or router level.
xpress-req-validator relies on [Joi](https://github.com/hapijs/joi) (the awsome JSON Schema validator), which is used to define the request validation specs

## Table of Contents

-   [Why xpress-req-validator](#why-xpress-req-validator)
-   [Installation](#installation)
-   [Basic Usage](#basic-usage)
-   [Changelog](#changelog)
-   [License](#license)

### Why xpress-req-validator

Request validation is a must when developing an API. Express allows following means to achieve this.

1. Handling validation logic in each route handler (method-1)

```node
router.post('/device/data', (req, res) => {
        const {deviceID, serialNo} = req.nody;
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

Method-1 is an ugly and painful way of achieving request validation. Method-2 is comparatively better, but it still requires you to write ton of middleware.
Both methods demand a significant effort to unit test the route handler. 

There has to be a better way of validating requests with less testing effort and of course by separating the concerns. xpress-req-validator is the option.
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

### Changelog

### License
