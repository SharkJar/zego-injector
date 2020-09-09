/*
 * @Author: Johnny.xushaojia 
 * @Date: 2020-09-08 18:16:05 
 * @Last Modified by: Johnny.xushaojia
 * @Last Modified time: 2020-09-09 16:12:49
 */
import { PARAM_DECORATOR } from "../constan";
import { Factory } from "./Injector";

type paramFactory = { methodName: string,factory: Function,inject?: any[],type:any }
type paramData = { methodName: string,data: any }

/**
 * 初始化类的属性
 * @param map
 * @param target
 */
export const initParams = function (target: any) {
    // 属性装饰器
    const params = Reflect.getMetadata(PARAM_DECORATOR, target);
    // 没有被装饰
    if(!(params instanceof Map)){ return }

    Array.from(params.keys()).forEach(methodName => {
        // 拿到原方法
        const senderFunc = target.prototype[methodName];
        // 拿到该方法的参数描述器
        const queryMap:Map<number,any> = params.get(methodName)
        // 当前原型上没有该方法
        if(!(methodName in target.prototype) || !(queryMap instanceof Map)){ return }
        // 代理函数 用于参数包装
        const proxyFunction = function (this: any, ...args:any[]){
            Array.from(queryMap.keys()).forEach(index => {
                const paramConfig:paramFactory | paramData = queryMap.get(index)
                const { data } = paramConfig as paramData
                if(data){ return args[index] = data }
                const { type,factory,inject } = paramConfig as paramFactory
                const paramsInstance = (Array.isArray(inject)? inject : []).map(sender => Factory.create(sender))
                if(typeof factory === "function"){ return args[index] = factory(...paramsInstance,methodName,index,type,args[1]) }
            })
            return typeof senderFunc === "function" ? senderFunc.apply(this,args) : undefined
        }
        // 删除原方法
        if(!(delete target.prototype[methodName])){ return }
        // 只有删除成功之后 在附加
        return Object.defineProperty(target.prototype,methodName,{
            enumerable: true,
            configurable: true,
            get:() => proxyFunction
        })
    })
};