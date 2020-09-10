"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProperty = void 0;
var constan_1 = require("../constan");
var Injector_1 = require("./Injector");
var noop = function () { };
var proxy = function (propertyName, target, propConfig) {
    var data = propConfig.data;
    var _a = propConfig, _b = _a.factory, factory = _b === void 0 ? noop : _b, inject = _a.inject;
    var descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
    var paramsInstance;
    var getter;
    if (!delete target.prototype[propertyName]) {
        return;
    }
    return Object.defineProperty(target.prototype, propertyName, {
        enumerable: true,
        configurable: true,
        get: function () {
            if (typeof data !== 'undefined') {
                return data;
            }
            paramsInstance = paramsInstance || (Array.isArray(inject) ? inject : []).map(function (sender) { return Injector_1.Factory.create(sender); });
            getter = getter || (descriptor === null || descriptor === void 0 ? void 0 : descriptor.value) ? function () { return descriptor === null || descriptor === void 0 ? void 0 : descriptor.value; } : (descriptor === null || descriptor === void 0 ? void 0 : descriptor.get) || noop;
            return typeof data === 'undefined' ? factory.apply(void 0, __spreadArrays(paramsInstance, [getter()])) : data;
        },
    });
};
exports.initProperty = function (target) {
    var propertyParams = Reflect.getMetadata(constan_1.PROPERTY_DECORATOR, target);
    if (!Array.isArray(propertyParams)) {
        return;
    }
    propertyParams.forEach(function (propertyConfig) {
        return proxy(propertyConfig.propertyName || '', target, propertyConfig);
    });
};
//# sourceMappingURL=initProperty.js.map