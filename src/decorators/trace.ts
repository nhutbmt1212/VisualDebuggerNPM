import { VisualDebugger } from '../index';
import { TraceOptions } from '../types/decorator.types';

export function Trace(options: TraceOptions = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (...args: any[]): any {
        // Handle Legacy (3 arguments)
        if (args.length === 3) {
            const [_target, propertyKey, descriptor] = args;
            const originalMethod = descriptor.value;

            if (originalMethod) {
                descriptor.value = async function (this: any, ...args: any[]) {
                    const name = options.name || propertyKey.toString();
                    return VisualDebugger.trace(name, async () => {
                        return originalMethod.apply(this, args);
                    });
                };
            }
            return descriptor;
        }

        // Handle Stage 3 (2 arguments: value, context)
        if (args.length === 2 && args[1]?.kind === 'method') {
            const [originalMethod, context] = args;
            const name = options.name || context.name.toString();

            return async function (this: any, ...args: any[]) {
                return VisualDebugger.trace(name, async () => {
                    return originalMethod.apply(this, args);
                });
            };
        }
    };
}
