/*
 * @Author: Johnny.xushaojia
 * @Date: 2020-09-07 11:40:25
 * @Last Modified by: Johnny.xushaojia
 * @Last Modified time: 2020-09-09 14:44:12
 */
import { PROPERTY_DECORATOR } from './constan';

type propertyFactory = { propertyName?: string; factory: Function; inject?: any[] };
type propertyData = { propertyName?: string; data: any };
/**
 * 帮助创建属性装饰器
 * @param options
 */
export const createPropertyDecorator = function (options: propertyFactory | propertyData) {
  return (target: any, propertyName: string) => {
    let propertyParams = Reflect.getMetadata(PROPERTY_DECORATOR, target.constructor);
    //告诉当前是哪个属性
    options.propertyName = propertyName;
    //必须是数组
    propertyParams = Array.isArray(propertyParams) ? propertyParams : [];
    //添加一个新的属性描述
    propertyParams.push(options);
    //重新写入
    Reflect.defineMetadata(PROPERTY_DECORATOR, propertyParams, target.constructor);
  };
};
