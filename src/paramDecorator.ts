/*
 * @Author: Johnny.xushaojia
 * @Date: 2020-09-07 11:38:10
 * @Last Modified by: Johnny.xushaojia
 * @Last Modified time: 2020-09-09 15:01:38
 */
import { PARAM_DECORATOR, PARAM_TYPES } from './constan';

/**
 * 帮助创建参数装饰器
 * @param options
 */
export const createParamDecorator = function (options: {
  paramIndex?: number;
  methodName?: string;
  factory?: Function;
  inject?: any[];
  data?: any;
  type?: any;
}) {
  return (target: any, methodName: string, paramIndex: number) => {
    let params = Reflect.getMetadata(PARAM_DECORATOR, target.constructor);
    // 拿到当前参数的类型
    let types = Reflect.getMetadata(PARAM_TYPES, target, methodName) || [];
    // 必须是字典
    params = params instanceof Map ? params : new Map();
    // 方法参数字典
    let queryMap:Map<number,any> = params.get(paramIndex) || new Map();
    // 告诉是第几个参数
    options.paramIndex = paramIndex;
    // 告诉是什么方法名称
    options.methodName = methodName;
    // 告诉当前参数是什么类型
    options.type = types[paramIndex];
    // 设置给方法字典
    queryMap.set(paramIndex,options);
    // 设置给constructor 
    params.set(methodName,queryMap);
    // 重新写入
    Reflect.defineMetadata(PARAM_DECORATOR, params, target.constructor);
  };
};
