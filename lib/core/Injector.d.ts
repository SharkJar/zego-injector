import 'reflect-metadata';
declare type constructor = new (...args: any[]) => any;
declare type useFactoryParams = {
    useFactory: (...args: any[]) => any;
    inject?: any[];
    provide: any;
};
declare type useClassParams = {
    useClass: constructor;
    provide: any;
};
declare type useValueParams = {
    useValue: any;
    provide: any;
};
export declare const Injectable: () => (target: Function) => void;
export declare class Factory {
    private static instance;
    private constructor();
    static useClass(params: useClassParams): void;
    static useValue(param: useValueParams): void;
    static useFactory(params: useFactoryParams): void;
    static createConstructor<TOutput = any>(creator: constructor, provide?: any, inject?: any[]): any;
    static createFactory<TOutput = any>(createFunction: Function, provide: any, inject?: any[]): any;
}
export {};
