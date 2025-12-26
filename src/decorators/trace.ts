import { VisualDebugger } from '../index';
import { TraceOptions } from '../types/decorator.types';

export function Trace(options: TraceOptions = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (
        _target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor | void {
        const originalMethod = descriptor.value;

        if (originalMethod) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            descriptor.value = async function (this: any, ...args: any[]) {
                const name = options.name || propertyKey;

                return VisualDebugger.trace(name, async () => {
                    return originalMethod.apply(this, args);
                });
            };
        }

        return descriptor;
    };
}
