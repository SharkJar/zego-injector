/*
 * @Author: Johnny.xushaojia
 * @Date: 2020-09-08 18:16:05
 * @Last Modified by: Johnny.xushaojia
 * @Last Modified time: 2020-09-09 16:12:44
 */
import { PROPERTY_DECORATOR } from '../constan';
import { Factory } from './Injector';

type propertyFactory = { propertyName: string; factory: Function; inject?: any[] };
type propertyData = { propertyName: string; data: any };

const noop = function () {};
const proxy = function (propertyName: string, target: any, propConfig: propertyFactory | propertyData) {
  const { data } = propConfig as propertyData;
  const { factory = noop, inject } = propConfig as propertyFactory;
  let descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
  let paramsInstance: any[];
  let getter: Function;
  // 删除原属性
  if (!delete target.prototype[propertyName]) {
    return;
  }
  // 只有删除成功之后 在附加
  return Object.defineProperty(target.prototype, propertyName, {
    enumerable: true,
    configurable: true,
    get() {
      if (typeof data !== 'undefined') {
        return data;
      }
      paramsInstance = paramsInstance || (Array.isArray(inject) ? inject : []).map((sender) => Factory.create(sender));
      getter = getter || descriptor?.value ? () => descriptor?.value : descriptor?.get || noop;
      return typeof data === 'undefined' ? factory(...paramsInstance, getter()) : data;
    },
  });
};

/**
 * 初始化类的属性
 * @param map
 * @param target
 */
export const initProperty = function (target: any) {
  // 属性装饰器
  const propertyParams = Reflect.getMetadata(PROPERTY_DECORATOR, target);
  if (!Array.isArray(propertyParams)) {
    return;
  }
  // 做代理
  propertyParams.forEach((propertyConfig: propertyFactory | propertyData) =>
    proxy(propertyConfig.propertyName || '', target, propertyConfig),
  );
};
