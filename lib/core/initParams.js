"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initParams = void 0;
var constan_1 = require("../constan");
var Injector_1 = require("./Injector");
exports.initParams = function (target) {
    var params = Reflect.getMetadata(constan_1.PARAM_DECORATOR, target);
    if (!(params instanceof Map)) {
        return;
    }
    Array.from(params.keys()).forEach(function (methodName) {
        var senderFunc = target.prototype[methodName];
        var queryMap = params.get(methodName);
        if (!(methodName in target.prototype) || !(queryMap instanceof Map)) {
            return;
        }
        var proxyFunction = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            Array.from(queryMap.keys()).forEach(function (index) {
                var paramConfig = queryMap.get(index);
                var data = paramConfig.data;
                if (data) {
                    return args[index] = data;
                }
                var _a = paramConfig, type = _a.type, factory = _a.factory, inject = _a.inject;
                var paramsInstance = (Array.isArray(inject) ? inject : []).map(function (sender) { return Injector_1.Factory.createConstructor(sender); });
                if (typeof factory === "function") {
                    return args[index] = factory.apply(void 0, __spreadArrays(paramsInstance, [methodName, index, type, args[1]]));
                }
            });
            return typeof senderFunc === "function" ? senderFunc.apply(this, args) : undefined;
        };
        if (!(delete target.prototype[methodName])) {
            return;
        }
        return Object.defineProperty(target.prototype, methodName, {
            enumerable: true,
            configurable: true,
            get: function () { return proxyFunction; }
        });
    });
};
//# sourceMappingURL=initParams.js.map