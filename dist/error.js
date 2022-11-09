"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = exports.ValidationError = void 0;
var BaseError = /** @class */ (function (_super) {
    __extends(BaseError, _super);
    function BaseError(message, status) {
        if (status === void 0) { status = 500; }
        var _this = _super.call(this, message) || this;
        _this.status = status;
        Error.captureStackTrace(_this, _this.constructor);
        Object.setPrototypeOf(_this, BaseError.prototype);
        return _this;
    }
    return BaseError;
}(Error));
exports.BaseError = BaseError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(data) {
        var _this = _super.call(this, "Validation Error", 400) || this;
        _this.data = data;
        _this.status = 400;
        Object.setPrototypeOf(_this, ValidationError.prototype);
        return _this;
    }
    return ValidationError;
}(BaseError));
exports.ValidationError = ValidationError;
