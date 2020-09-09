declare type propertyFactory = {
    propertyName?: string;
    factory: Function;
    inject?: any[];
};
declare type propertyData = {
    propertyName?: string;
    data: any;
};
export declare const createPropertyDecorator: (options: propertyFactory | propertyData) => (target: any, propertyName: string) => void;
export {};
