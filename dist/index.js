"use strict";
var error_1 = require("./error");
/**
 * validateRequest
 * @param validateParams ValidationParam
 */
function validateMiddleware(validateParams) {
    return function (req, res, next) {
        var _a, _b, _c;
        try {
            var errors = [];
            for (var _i = 0, _d = Object.entries(validateParams); _i < _d.length; _i++) {
                var _e = _d[_i], key = _e[0], value = _e[1];
                for (var _f = 0, value_1 = value; _f < value_1.length; _f++) {
                    var param = value_1[_f];
                    var keyArray = param.key;
                    if (param.validators !== undefined) {
                        for (var _g = 0, _h = [keyArray].flat(); _g < _h.length; _g++) {
                            var k = _h[_g];
                            if (!doesRequiredFieldExist(req[key], errors, k, param)) {
                                errors.length > 0 && next(new error_1.ValidationError(errors));
                                return;
                            }
                            if (!validateFunctionWithKey(req[key], errors, k, param)) {
                                next(new error_1.ValidationError(errors));
                                return;
                            }
                        }
                    }
                    else if (param.validatorsWithParams !== undefined) {
                        for (var _j = 0, _k = [keyArray].flat(); _j < _k.length; _j++) {
                            var k = _k[_j];
                            if (param.type === "array") {
                                if (!req[key] ||
                                    !req[key][k] ||
                                    !Array.isArray(JSON.parse(req[key][k]))) {
                                    errors.push((_a = {}, _a[k] = "".concat(k, " is expected to be an array"), _a));
                                    next(new error_1.ValidationError(errors));
                                    return;
                                }
                                var parsedResult = JSON.parse(req[key][k]);
                                for (var index = 0; index < parsedResult.length; index++) {
                                    var value_2 = parsedResult[index];
                                    if (!value_2 || !isObject(value_2)) {
                                        errors.push((_b = {},
                                            _b[k] = "Array ".concat(k, " at index ").concat(index, " is expected to be an object"),
                                            _b));
                                        next(new error_1.ValidationError(errors));
                                        return;
                                    }
                                    for (var _l = 0, _m = param.validatorsWithParams; _l < _m.length; _l++) {
                                        var validator = _m[_l];
                                        var validatorKey = validator.key;
                                        for (var _o = 0, _p = [validatorKey].flat(); _o < _p.length; _o++) {
                                            var v = _p[_o];
                                            if (!doesRequiredFieldExist(value_2, errors, v, validator, k)) {
                                                errors.length > 0 && next(new error_1.ValidationError(errors));
                                                return;
                                            }
                                            if (!validateFunctionWithKey(value_2, errors, v, validator)) {
                                                next(new error_1.ValidationError(errors));
                                                return;
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if (!req[key] ||
                                    !req[key][k] ||
                                    !isObject(JSON.parse(req[key][k]))) {
                                    errors.push((_c = {},
                                        _c[k] = "".concat(k, " is expected to be an ").concat(param.type),
                                        _c));
                                    next(new error_1.ValidationError(errors));
                                    return;
                                }
                                var reqFiltered = JSON.parse(req[key][k]);
                                for (var _q = 0, _r = param.validatorsWithParams; _q < _r.length; _q++) {
                                    var validator = _r[_q];
                                    var validatorKey = validator.key;
                                    for (var _s = 0, _t = [validatorKey].flat(); _s < _t.length; _s++) {
                                        var v = _t[_s];
                                        if (!doesRequiredFieldExist(reqFiltered, errors, v, validator, k)) {
                                            errors.length > 0 && next(new error_1.ValidationError(errors));
                                            return;
                                        }
                                        if (!validateFunctionWithKey(reqFiltered, errors, v, validator)) {
                                            next(new error_1.ValidationError(errors));
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            next();
        }
        catch (error) {
            if (error instanceof Error) {
                next(new error_1.BaseError(error.message));
            }
            else {
                next(new error_1.BaseError("Something went wrong."));
            }
        }
    };
}
function validateFunctionWithKey(reqFiltered, errors, property, param) {
    var _a;
    var validators = param.validators;
    if (validators === undefined) {
        return true;
    }
    for (var _i = 0, validators_1 = validators; _i < validators_1.length; _i++) {
        var validator = validators_1[_i];
        var validatorFn = validator[0], errorMessage = validator[1];
        if (!validatorFn) {
            continue;
        }
        if (reqFiltered &&
            reqFiltered[property] &&
            !validatorFn(reqFiltered[property])) {
            errors.push((_a = {}, _a[property] = errorMessage, _a));
            if (errors.length > 0) {
                return false;
            }
            else {
                return true;
            }
        }
    }
    return true;
}
function doesRequiredFieldExist(reqFiltered, errors, property, param, parent) {
    var _a, _b;
    var required = param.required;
    if (required && !reqFiltered[property]) {
        if (parent) {
            errors.push((_a = {},
                _a["".concat(parent, ".").concat(property)] = "".concat(parent, ".").concat(property, " is required"),
                _a));
        }
        else {
            errors.push((_b = {}, _b[property] = "".concat(property, " is required"), _b));
        }
        return false;
    }
    else if (!required && !reqFiltered[property]) {
        return true;
    }
    return true;
}
/**
 * checks if a value is an object
 * @param obj unknown
 * @returns true/false
 */
var isObject = function (obj) {
    var ret = obj && Object.getPrototypeOf(obj) === Object.getPrototypeOf({});
    return ret;
};
module.exports = validateMiddleware;
