export function Debug() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor | void {
        const originalMethod = descriptor.value;

        if (originalMethod) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            descriptor.value = function (this: any, ...args: any[]) {
                if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-debugger
                    debugger;
                }
                return originalMethod.apply(this, args);
            };
        }

        return descriptor;
    };
}
