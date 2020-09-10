/*
 * @Author: Johnny.xushaojia
 * @Date: 2020-09-08 15:21:41
 * @Last Modified by: Johnny.xushaojia
 * @Last Modified time: 2020-09-10 17:39:51
 */
import 'reflect-metadata';
import { PARAM_TYPES, INJECTABLE_DECORATOR } from '../constan';
import { initProperty } from './initProperty';
import { initParams } from './initParams';

type constructor = new (...args: any[]) => any;
type useFactoryParams = { useFactory: (...args: any[]) => any; inject?: any[]; provide: any };
type useClassParams = { useClass: constructor; provide: any };
type useValueParams = { useValue: any; provide: any };
type module = { provide: any; instance?: any; inject?: any[]; constructor?: constructor; createFunction?: Function };

/**
 * 帮助获取到class的constructor的入参
 */
export const Injectable = function () {
  return (target: Function) => {
    const constructor = target.prototype.constructor;
    Reflect.defineMetadata(INJECTABLE_DECORATOR, { injectable: true }, target);
    Factory.useClass({ provide: constructor, useClass: constructor });
  };
};

class InjectHelper {
  // 用于存放解析的module
  private modules: Map<any, module> = new Map();

  /**
   * 检查constructor 是否被injectable过  如果没有被injectable过的 是不能拿到入参类型的
   * @param creator
   */
  private isInjected(creator: constructor) {
    const injectParams = Reflect.getMetadata(INJECTABLE_DECORATOR, creator);
    return !!(injectParams && injectParams.injectable);
  }

  /**
   * 拿到constructor的入参类型
   * @param creator
   */
  private getConstructorParamTypes(creator: constructor) {
    const constructor = creator.prototype.constructor;
    if (!this.isInjected(constructor)) {
      throw new Error(`请在${creator.name}定义的时候加上 @Injectable()`);
    }
    // 拿到构造参数
    const injectorTypes = Reflect.getMetadata(PARAM_TYPES, constructor) || [];
    // 返回构造函数需要的参数类型
    return injectorTypes;
  }

  /**
   * 创建对象
   * @param provide
   */
  private createModule<TOutput = any>(provide: any) {
    // 获取module信息
    const mod: module | undefined = this.modules.get(provide);
    // module不存在
    if (mod === undefined) {
      throw new Error(`没有找到${provide} 请确定是否已经injectable过`);
    }
    if (mod.constructor == undefined && mod.createFunction == undefined) {
      throw new Error(`请确保${provide} 使用了useClass 或者 useFactory`);
    }
    //
    let instance;
    // 通过构造函数创建
    if (mod.constructor) {
      instance = this.createConstructor(mod.constructor, mod.provide, mod.inject);
    }
    // 通过factory创建
    if (mod.createFunction) {
      instance = this.createFactory(mod.createFunction, mod.provide, mod.inject);
    }
    // 返回
    return instance as TOutput;
  }

  /**
   * 根据class 注册一个module
   * 如果provide已经存在 则不进行任何处理
   * @param params
   */
  public useClass(params: useClassParams) {
    const { provide, useClass } = params;
    // 已经存在
    if (this.modules.has(provide)) {
      return;
    }
    // 拿到构造函数
    const constructor = useClass.prototype.constructor;
    // 拿到构造函数的参数类型
    const injectorTypes = this.getConstructorParamTypes(constructor);
    // 创建module需要的参数
    const mod: module = { provide, inject: injectorTypes, constructor };
    // 进行添加到注册
    this.modules.set(provide, mod);
  }

  /**
   * 根据已经创建的实例useValue 注册一个module
   * 如果provide已经存在 则不进行任何处理
   * @param params
   */
  public useValue(params: useValueParams) {
    const { provide, useValue } = params;
    // 已经存在
    if (this.modules.has(provide)) {
      return;
    }
    // 创建module
    const mod: module = { provide, instance: useValue, constructor: undefined };
    // 进行添加到注册
    this.modules.set(provide, mod);
  }

  /**
   * 根据注册工厂 注册一个module
   * 如果provide已经存在 则不进行任何处理
   * @param params
   */
  public useFactory(params: useFactoryParams) {
    const { inject = [], useFactory, provide } = params;
    // 已经存在
    if (this.modules.has(provide)) {
      return;
    }
    // 创建module
    const mod: module = { provide, inject, createFunction: useFactory, constructor: undefined };
    // 添加到注册
    this.modules.set(provide, mod);
  }

  /**
   * 替换一个现有已经声明的module
   * 如果已经被别的constructor实例化过的 就不会替换到，但是被createParamDecorator的部分 可以被动态拿到
   * @param params
   */
  public useReplace(params: useClassParams | useValueParams | useFactoryParams) {
    const classParams = params as useClassParams;
    const valueParams = params as useValueParams;
    const factoryParams = params as useFactoryParams;

    // 删除之前的声明以及实例
    this.modules.delete(params.provide)

    if (typeof valueParams.useValue !== 'undefined') {
      this.useValue(valueParams);
    } else if (typeof factoryParams.useFactory !== 'undefined') {
      this.useFactory(factoryParams);
    } else if (typeof classParams.useClass !== 'undefined') {
      this.useClass(classParams);
    }
  }

  /**
   * 创建一个module
   * @param creator
   */
  public create<TOutput = any>(creator: constructor | any) {
    // 拿到module 进行创建使用
    const mod: module | undefined = this.modules.get(creator);
    // module没有注册过
    if (mod === undefined) {
      return;
    }
    // 模块已经被创建
    if (mod.instance) {
      return mod.instance;
    }
    // 如果module是constructor模式
    if (mod.constructor) {
      return this.createConstructor(mod.constructor, mod.provide, mod.inject);
    }
    // 如果module是createFunction模式
    if (mod.createFunction) {
      return this.createFactory(mod.createFunction, mod.provide, mod.instance);
    }
  }

  /**
   * 根据constructor创建一个对象 首先这个class必须被typescript的Decrator过
   * 如果对象已经创建过 则直接返回之前已经创建的对象
   * @param creator
   * @param provide
   */
  public createConstructor<TOutput = any>(creator: constructor | any, provide?: any, inject?: any[]) {
    // 如果provide没有传递 默认使用creator 作为字典
    provide = provide || creator;
    // 拿到module 进行创建使用
    const mod: module = this.modules.get(provide) || {
      inject: Array.isArray(inject) ? inject : this.getConstructorParamTypes(creator),
      constructor: creator,
      provide,
    };

    // 已经存在实例
    if (mod.instance) {
      return mod.instance;
    }
    // 用户可能使用的useClass进行的创建
    const ctor = mod.constructor || creator;
    // 进行属性初始化
    initProperty(ctor);
    // 初始化参数构造器
    initParams(ctor);
    // 返回创建对象
    const paramsInstance = (mod.inject || []).map(this.createModule.bind(this));

    // 创建对象
    mod.instance = new ctor(...paramsInstance);
    // 更新到modules
    this.modules.set(provide, mod);

    // 返回结果
    return mod.instance as TOutput;
  }

  /**
   * 根据function返回的对象 作为实例
   * @param createFunction
   * @param provide
   * @param inject
   */
  public createFactory<TOutput = any>(createFunction: Function, provide: any, inject?: any[]) {
    // 拿到module 进行创建使用
    const mod: module = this.modules.get(provide) || {
      inject: Array.isArray(inject) ? inject : [],
      createFunction,
      provide,
      constructor: undefined,
    };
    // 已经存在实例
    if (mod.instance) {
      return mod.instance;
    }
    // 返回创建对象
    const paramsInstance = (mod.inject || []).map(this.createModule.bind(this));
    // 创建对象
    mod.instance = createFunction(...paramsInstance);
    // 更新到modules
    this.modules.set(provide, mod);
    // 返回结果
    return mod.instance as TOutput;
  }

  /**
   * 返回已经创建的实例
   * @param provide
   */
  public getInstance<TOutput = any>(provide: any) {
    // 拿到module
    const mod: module | undefined = this.modules.get(provide);
    // 已经存在实例
    if (mod?.instance) {
      return mod.instance;
    }
    // 不存在 直接返回null
    return null;
  }
}

export class Factory {
  private static instance: InjectHelper = new InjectHelper();
  private constructor() {}

  /**
   * 根据class 注册一个module
   * 如果provide已经存在 则不进行任何处理
   * @param params
   */
  public static useClass(params: useClassParams) {
    Factory.instance.useClass(params);
  }

  /**
   * 根据已经创建的实例useValue 注册一个module
   * 如果provide已经存在 则不进行任何处理
   * @param params
   */
  public static useValue(param: useValueParams) {
    Factory.instance.useValue(param);
  }

  /**
   * 根据注册工厂 注册一个module
   * 如果provide已经存在 则不进行任何处理
   * @param params
   */
  public static useFactory(params: useFactoryParams) {
    Factory.instance.useFactory(params);
  }

  /**
   * 替换一个现有已经声明的module
   * 如果已经被别的constructor实例化过的 就不会替换到，但是被createParamDecorator的部分 可以被动态拿到
   * @param params
   */
  public static useReplace(params: useClassParams | useValueParams | useFactoryParams) {
    return Factory.instance.useReplace(params);
  }

  /**
   * 根据constructor创建一个对象 首先这个class必须被typescript的Decrator过
   * 如果对象已经创建过 则直接返回之前已经创建的对象
   * @param creator
   * @param provide
   */
  public static createConstructor<TOutput = any>(creator: constructor | any, provide?: any, inject?: any[]) {
    return Factory.instance.createConstructor<TOutput>(creator, provide, inject);
  }

  /**
   * 根据function返回的对象 作为实例
   * @param createFunction
   * @param provide
   * @param inject
   */
  public static createFactory<TOutput = any>(createFunction: Function, provide: any, inject?: any[]) {
    return Factory.instance.createFactory<TOutput>(createFunction, provide, inject);
  }

  /**
   * 返回已经创建的实例
   * @param provide
   */
  public static getInstance<TOutput = any>(provide: any) {
    return Factory.instance.getInstance<TOutput>(provide);
  }

  /**
   * 创建一个module
   * @param creator
   */
  public static create<TOutput = any>(creator: constructor | any) {
    return Factory.instance.create<TOutput>(creator);
  }
}
