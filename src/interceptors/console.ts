import { VisualDebugger } from '../index';

export function setupConsoleInterceptor() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    function isInternalLog(args: unknown[]) {
        return args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('[VisualDebugger]');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log = (...args: any[]) => {
        if (!isInternalLog(args)) {
            VisualDebugger.log('console.log', { data: args });
        }
        originalLog.apply(console, args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
        if (!isInternalLog(args)) {
            VisualDebugger.log('console.error', { data: args });
        }
        originalError.apply(console, args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn = (...args: any[]) => {
        if (!isInternalLog(args)) {
            VisualDebugger.log('console.warn', { data: args });
        }
        originalWarn.apply(console, args);
    };
}
