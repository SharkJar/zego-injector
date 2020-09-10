"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factory = exports.Injectable = void 0;
require("reflect-metadata");
var constan_1 = require("../constan");
var initProperty_1 = require("./initProperty");
var initParams_1 = require("./initParams");
exports.Injectable = function () {
    return function (target) {
        var constructor = target.prototype.constructor;
        Reflect.defineMetadata(constan_1.INJECTABLE_DECORATOR, { injectable: true }, target);
        Factory.useClass({ provide: constructor, useClass: constructor });
    };
};
var InjectHelper = (function () {
    function InjectHelper() {
        this.modules = new Map();
    }
    InjectHelper.prototype.isInjected = function (creator) {
        var injectParams = Reflect.getMetadata(constan_1.INJECTABLE_DECORATOR, creator);
        return !!(injectParams && injectParams.injectable);
    };
    InjectHelper.prototype.getConstructorParamTypes = function (creator) {
        var constructor = creator.prototype.constructor;
        if (!this.isInjected(constructor)) {
            throw new Error("\u8BF7\u5728" + creator.name + "\u5B9A\u4E49\u7684\u65F6\u5019\u52A0\u4E0A @Injectable()");
        }
        var injectorTypes = Reflect.getMetadata(constan_1.PARAM_TYPES, constructor) || [];
        return injectorTypes;
    };
    InjectHelper.prototype.createModule = function (provide) {
        var mod = this.modules.get(provide);
        if (mod === undefined) {
            throw new Error("\u6CA1\u6709\u627E\u5230" + provide + " \u8BF7\u786E\u5B9A\u662F\u5426\u5DF2\u7ECFinjectable\u8FC7");
        }
        if (mod.constructor == undefined && mod.createFunction == undefined) {
            throw new Error("\u8BF7\u786E\u4FDD" + provide + " \u4F7F\u7528\u4E86useClass \u6216\u8005 useFactory");
        }
        var instance;
        if (mod.constructor) {
            instance = this.createConstructor(mod.constructor, mod.provide, mod.inject);
        }
        if (mod.createFunction) {
            instance = this.createFactory(mod.createFunction, mod.provide, mod.inject);
        }
        return instance;
    };
    InjectHelper.prototype.useClass = function (params) {
        var provide = params.provide, useClass = params.useClass;
        if (this.modules.has(provide)) {
            return;
        }
        var constructor = useClass.prototype.constructor;
        var injectorTypes = this.getConstructorParamTypes(constructor);
        var mod = { provide: provide, inject: injectorTypes, constructor: constructor };
        this.modules.set(provide, mod);
    };
    InjectHelper.prototype.useValue = function (params) {
        var provide = params.provide, useValue = params.useValue;
        if (this.modules.has(provide)) {
            return;
        }
        var mod = { provide: provide, instance: useValue, constructor: undefined };
        this.modules.set(provide, mod);
    };
    InjectHelper.prototype.useFactory = function (params) {
        var _a = params.inject, inject = _a === void 0 ? [] : _a, useFactory = params.useFactory, provide = params.provide;
        if (this.modules.has(provide)) {
            return;
        }
        var mod = { provide: provide, inject: inject, createFunction: useFactory, constructor: undefined };
        this.modules.set(provide, mod);
    };
    InjectHelper.prototype.useReplace = function (params) {
        var classParams = params;
        var valueParams = params;
        var factoryParams = params;
        this.modules.delete(params.provide);
        if (typeof valueParams !== 'undefined') {
            this.useValue(valueParams);
        }
        else if (typeof factoryParams.useFactory !== 'undefined') {
            this.useFactory(factoryParams);
        }
        else if (typeof classParams !== 'undefined') {
            this.useClass(classParams);
        }
    };
    InjectHelper.prototype.create = function (creator) {
        var mod = this.modules.get(creator);
        if (mod === undefined) {
            return;
        }
        if (mod.instance) {
            return mod.instance;
        }
        if (mod.constructor) {
            return this.createConstructor(mod.constructor, mod.provide, mod.inject);
        }
        if (mod.createFunction) {
            return this.createFactory(mod.createFunction, mod.provide, mod.instance);
        }
    };
    InjectHelper.prototype.createConstructor = function (creator, provide, inject) {
        provide = provide || creator;
        var mod = this.modules.get(provide) || {
            inject: Array.isArray(inject) ? inject : this.getConstructorParamTypes(creator),
            constructor: creator,
            provide: provide,
        };
        if (mod.instance) {
            return mod.instance;
        }
        var ctor = mod.constructor || creator;
        initProperty_1.initProperty(ctor);
        initParams_1.initParams(ctor);
        var paramsInstance = (mod.inject || []).map(this.createModule.bind(this));
        mod.instance = new (ctor.bind.apply(ctor, __spreadArrays([void 0], paramsInstance)))();
        this.modules.set(provide, mod);
        return mod.instance;
    };
    InjectHelper.prototype.createFactory = function (createFunction, provide, inject) {
        var mod = this.modules.get(provide) || {
            inject: Array.isArray(inject) ? inject : [],
            createFunction: createFunction,
            provide: provide,
            constructor: undefined,
        };
        if (mod.instance) {
            return mod.instance;
        }
        var paramsInstance = (mod.inject || []).map(this.createModule.bind(this));
        mod.instance = createFunction.apply(void 0, paramsInstance);
        this.modules.set(provide, mod);
        return mod.instance;
    };
    InjectHelper.prototype.getInstance = function (provide) {
        var mod = this.modules.get(provide);
        if (mod === null || mod === void 0 ? void 0 : mod.instance) {
            return mod.instance;
        }
        return null;
    };
    return InjectHelper;
}());
var Factory = (function () {
    function Factory() {
    }
    Factory.useClass = function (params) {
        Factory.instance.useClass(params);
    };
    Factory.useValue = function (param) {
        Factory.instance.useValue(param);
    };
    Factory.useFactory = function (params) {
        Factory.instance.useFactory(params);
    };
    Factory.useReplace = function (params) {
        return Factory.instance.useReplace(params);
    };
    Factory.createConstructor = function (creator, provide, inject) {
        return Factory.instance.createConstructor(creator, provide, inject);
    };
    Factory.createFactory = function (createFunction, provide, inject) {
        return Factory.instance.createFactory(createFunction, provide, inject);
    };
    Factory.getInstance = function (provide) {
        return Factory.instance.getInstance(provide);
    };
    Factory.create = function (creator) {
        return Factory.instance.create(creator);
    };
    Factory.instance = new InjectHelper();
    return Factory;
}());
exports.Factory = Factory;
//# sourceMappingURL=Injector.js.map