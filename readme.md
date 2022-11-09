# express-self-validator

_This is a self express validator middleware._


This middleware accepts validation function and returns a middleware that validates the request.

written in typescript.

## Installation

```bash
npm install express-self-validator
```


## Usage

```javascript
const express = require('express');
const expressSelfValidator = require('express-self-validator');

// you can pass a validation function to the middleware
const isNumber = (value) => {
  return !isNaN(value);
};

const app = express();
app.get('/', expressSelfValidator({
    // validation on the request query params
    query: {
        // key is the name of the query parameter
        key: "offest",
        // custom validation function
        // not that each validation function should return a boolean
        // and the validation function should be sync
        validators: [
            [isNumber, "offset must be a number"],
            // we can be sure value to be number here because of the previous validation
            [(value) => value < 0, "offset must be greater than 0"]
            [(value) => value > 100 , "offset must be less than 100"]
        ],
        // optional, default is false
        required: true,
    }
}) , (req, res) => {
  res.send('Hello World!');
});
```
you can validate request body, query, params


for example to validate request body you can do this:

```javascript
{
    body: {
        key: "name",
        validators: [
            [isString, "name must be a string"],
            [(value) => value.length > 3 && value.length < 10>, "name must be between 3 and 10"],
        ],
        required: true,
    }
}
```
## handling validation errors
    
when using this middleware, you can handle validation errors by catching those errors in your error handling middleware.

the middleware will throw an error with the following structure:

```javascript
{
    status: 400 // 0r 500 ( if there were an error running validator functions) , depends on the error
    message: "validation error",
    errors: [
        {
            key: "name",
            message: "name must be a string"
        },
        {
            key: "name",
            message: "name must be between 3 and 10"
        }
    ]
    isOperational: true
}
```
i.e if you pass a validator function that has an error the middleware will throw a BaseError with status 500 and message 
```javascript
{
    status: 500,
    message: "undefined is not a function",
}
```

```javascript
app.use((err, req, res, next) => {
    if (err instanceof expressSelfValidator.ValidationError) {
        res.status(err.status).json({
            message: err.message,
            errors: err.errors
        })
    } else if (err instanceof expressSelfValidator.BaseError) {
        // 500 error
        res.status(err.status).json({
            message: err.message
        })
    } else
        next(err);
    }
});
```


## License
[MIT](https://choosealicense.com/licenses/mit/)