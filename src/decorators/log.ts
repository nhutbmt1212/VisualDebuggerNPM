import { VisualDebugger } from '../index';

export function Log(message?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (...args: any[]): any {
        // Handle Legacy (3 arguments)
        if (args.length === 3) {
            const [_target, propertyKey, descriptor] = args;
            const originalMethod = descriptor.value;

            if (originalMethod) {
                descriptor.value = function (this: any, ...args: any[]) {
                    VisualDebugger.log(message || `Calling ${propertyKey.toString()}`, { arguments: args });
                    return originalMethod.apply(this, args);
                };
            }
            return descriptor;
        }

        // Handle Stage 3 (2 arguments)
        if (args.length === 2 && args[1]?.kind === 'method') {
            const [originalMethod, context] = args;
            return function (this: any, ...args: any[]) {
                VisualDebugger.log(message || `Calling ${context.name.toString()}`, { arguments: args });
                return originalMethod.apply(this, args);
            };
        }
    };
}
