export declare const createFunctionDecorator: (options: {
    propertyName?: string;
    factory?: Function;
    data?: any;
}) => (target: any, propertyName: string, propertyDescriptor: PropertyDescriptor) => PropertyDescriptor;
