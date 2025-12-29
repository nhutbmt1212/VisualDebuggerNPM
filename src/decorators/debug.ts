export function Debug() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (...args: any[]): any {
        // Handle Legacy (3 arguments)
        if (args.length === 3) {
            const [_target, _propertyKey, descriptor] = args;
            const originalMethod = descriptor.value;

            if (originalMethod) {
                descriptor.value = function (this: any, ...args: any[]) {
                    if (process.env.NODE_ENV === 'development') {
                        // eslint-disable-next-line no-debugger
                        debugger;
                    }
                    return originalMethod.apply(this, args);
                };
            }
            return descriptor;
        }

        // Handle Stage 3 (2 arguments)
        if (args.length === 2 && args[1]?.kind === 'method') {
            const [originalMethod] = args;
            return function (this: any, ...args: any[]) {
                if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-debugger
                    debugger;
                }
                return originalMethod.apply(this, args);
            };
        }
    };
}
