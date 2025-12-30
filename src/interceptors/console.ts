import { VisualDebugger } from '../index';

// Store original console methods BEFORE any interception
const originalConsoleLog = console.log.bind(console);

/**
 * Check if a stack line is from SDK internal files
 */
function isInternalFile(line: string): boolean {
    // SDK internal paths to skip
    const sdkInternals = [
        'interceptors/console',
        'interceptors\\console',
        '/core/',
        '\\core\\',
        '/src/index.',
        '\\src\\index.',
        'decorators/trace',
        'decorators\\trace',
    ];

    for (const pattern of sdkInternals) {
        if (line.includes(pattern)) return true;
    }

    // Node internals
    if (line.includes('node:internal') ||
        line.includes('node:async') ||
        line.includes('node:events') ||
        line.includes('node:fs') ||
        line.includes('node:vm') ||
        line.includes('node_modules')) {
        return true;
    }

    return false;
}

/**
 * Extract caller info from error stack trace
 * Returns file path, line number, column number, and function name
 */
function getCallerInfo(): {
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    functionName?: string;
} {
    const error = new Error();
    const stack = error.stack || '';
    const lines = stack.split('\n');

    // Skip first lines: Error, getCallerInfo, console wrapper
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line || line === 'Error') continue;

        // Skip SDK internal files
        if (isInternalFile(line)) continue;

        // Try various stack trace formats:

        // Format 1: "at functionName (filePath:line:column)"
        let match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
        if (match) {
            const funcName = match[1];
            // Skip anonymous or internal functions
            if (funcName !== '<anonymous>' &&
                !funcName.includes('Module._compile') &&
                !funcName.includes('Module._extensions') &&
                !funcName.includes('Module.m._compile')) {

                // Handle Object.<anonymous> - extract as no function name
                const cleanFuncName = funcName === 'Object.<anonymous>'
                    ? undefined
                    : funcName.replace(/^Object\./, '');

                return {
                    functionName: cleanFuncName,
                    filePath: cleanFilePath(match[2]),
                    lineNumber: parseInt(match[3], 10),
                    columnNumber: parseInt(match[4], 10),
                };
            }
        }

        // Format 2: "at filePath:line:column" (anonymous function, no parens)
        match = line.match(/at\s+(.+):(\d+):(\d+)$/);
        if (match) {
            return {
                filePath: cleanFilePath(match[1]),
                lineNumber: parseInt(match[2], 10),
                columnNumber: parseInt(match[3], 10),
                functionName: undefined,
            };
        }
    }

    return {};
}

/**
 * Clean file path for display
 */
function cleanFilePath(filePath: string): string {
    // Remove file:// prefix if present
    let cleaned = filePath.replace(/^file:\/\/\//, '');

    // On Windows, convert forward slashes to backslashes
    // and ensure proper drive letter format
    if (cleaned.match(/^[A-Za-z]:\//)) {
        cleaned = cleaned.replace(/\//g, '\\');
    }

    return cleaned;
}

export function setupConsoleInterceptor() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    function isInternalLog(args: unknown[]) {
        return args.length > 0 && typeof args[0] === 'string' &&
            (args[0].startsWith('[VisualDebugger]') || args[0].startsWith('[SDK DEBUG]'));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log = (...args: any[]) => {
        if (!isInternalLog(args)) {
            const callerInfo = getCallerInfo();
            VisualDebugger.logWithLocation('console.log', args, callerInfo);
        }
        originalLog.apply(console, args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
        if (!isInternalLog(args)) {
            const callerInfo = getCallerInfo();
            VisualDebugger.logWithLocation('console.error', args, callerInfo);
        }
        originalError.apply(console, args);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn = (...args: any[]) => {
        if (!isInternalLog(args)) {
            const callerInfo = getCallerInfo();
            VisualDebugger.logWithLocation('console.warn', args, callerInfo);
        }
        originalWarn.apply(console, args);
    };
}
