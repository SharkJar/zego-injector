/*
 * @Author: Johnny.xushaojia
 * @Date: 2020-09-07 11:39:30
 * @Last Modified by: Johnny.xushaojia
 * @Last Modified time: 2020-09-07 11:41:15
 */
import { METHOD_DECORATOR } from './constan';

/**
 * 帮助创建方法装饰器
 * @param options
 */
export const createFunctionDecorator = function (options: { propertyName?: string; factory?: Function; data?: any }) {
  return (target: any, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
    let methodParams = Reflect.getMetadata(METHOD_DECORATOR, target.constructor);
    //告诉当前是哪个属性
    options.propertyName = propertyName;
    //必须是数组
    methodParams = Array.isArray(methodParams) ? methodParams : [];
    //添加一个新的属性描述
    methodParams.push(options);
    //重新写入
    Reflect.defineMetadata(METHOD_DECORATOR, methodParams, target.constructor);
    //返回
    return propertyDescriptor;
  };
};
