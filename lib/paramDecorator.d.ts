export declare const createParamDecorator: (options: {
    paramIndex?: number;
    methodName?: string;
    factory?: Function;
    data?: any;
    type?: any;
}) => (target: any, methodName: string, paramIndex: number) => void;
