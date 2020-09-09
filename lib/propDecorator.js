"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPropertyDecorator = void 0;
var constan_1 = require("./constan");
exports.createPropertyDecorator = function (options) {
    return function (target, propertyName) {
        var propertyParams = Reflect.getMetadata(constan_1.PROPERTY_DECORATOR, target.constructor);
        options.propertyName = propertyName;
        propertyParams = Array.isArray(propertyParams) ? propertyParams : [];
        propertyParams.push(options);
        Reflect.defineMetadata(constan_1.PROPERTY_DECORATOR, propertyParams, target.constructor);
    };
};
//# sourceMappingURL=propDecorator.js.map