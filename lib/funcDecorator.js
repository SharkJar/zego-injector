"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFunctionDecorator = void 0;
var constan_1 = require("./constan");
exports.createFunctionDecorator = function (options) {
    return function (target, propertyName, propertyDescriptor) {
        var methodParams = Reflect.getMetadata(constan_1.METHOD_DECORATOR, target.constructor);
        options.propertyName = propertyName;
        methodParams = Array.isArray(methodParams) ? methodParams : [];
        methodParams.push(options);
        Reflect.defineMetadata(constan_1.METHOD_DECORATOR, methodParams, target.constructor);
        return propertyDescriptor;
    };
};
//# sourceMappingURL=funcDecorator.js.map