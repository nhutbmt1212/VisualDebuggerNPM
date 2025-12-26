import { VisualDebugger } from '../index';

export function Log(message?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (
        _target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor | void {
        const originalMethod = descriptor.value;

        if (originalMethod) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            descriptor.value = function (this: any, ...args: any[]) {
                VisualDebugger.log(message || `Calling ${propertyKey}`, { arguments: args });
                return originalMethod.apply(this, args);
            };
        }

        return descriptor;
    };
}
