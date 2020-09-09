"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParamDecorator = void 0;
var constan_1 = require("./constan");
exports.createParamDecorator = function (options) {
    return function (target, methodName, paramIndex) {
        var params = Reflect.getMetadata(constan_1.PARAM_DECORATOR, target.constructor);
        var types = Reflect.getMetadata(constan_1.PARAM_TYPES, target, methodName) || [];
        params = params instanceof Map ? params : new Map();
        var queryMap = params.get(paramIndex) || new Map();
        options.paramIndex = paramIndex;
        options.methodName = methodName;
        options.type = types[paramIndex];
        queryMap.set(paramIndex, options);
        params.set(methodName, queryMap);
        Reflect.defineMetadata(constan_1.PARAM_DECORATOR, params, target.constructor);
    };
};
//# sourceMappingURL=paramDecorator.js.map