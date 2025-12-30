import { configManager } from './core/config';
import { VisualDebuggerConfig } from './types/config.types';
import { sessionManager } from './core/session';
import { eventQueue } from './core/queue';
import { generateId } from './utils/uuid';
import { DebugEvent } from './types/event.types';
import { setupFetchInterceptor } from './interceptors/fetch';
import { setupConsoleInterceptor } from './interceptors/console';

export class VisualDebugger {
    static init(config: VisualDebuggerConfig) {
        configManager.init(config);

        if (config.enableFetchInterceptor !== false) {
            setupFetchInterceptor();
        }

        if (config.enableConsoleInterceptor) {
            setupConsoleInterceptor();
        }

        this.log('SDK Initialized');
    }

    static async trace<T>(name: string, fn: () => Promise<T>): Promise<T> {
        const sessionId = sessionManager.getSessionId();
        const eventId = generateId();
        const startTime = Date.now();

        this.emit({
            id: eventId,
            sessionId,
            type: 'function_enter',
            timestamp: new Date().toISOString(),
            functionName: name,
            depth: 0, // Simplified for manual trace
        });

        try {
            const result = await fn();

            this.emit({
                id: generateId(),
                sessionId,
                type: 'function_exit',
                timestamp: new Date().toISOString(),
                functionName: name,
                parentEventId: eventId,
                returnValue: result,
                duration: Date.now() - startTime,
                depth: 0,
            });

            return result;
        } catch (error) {
            this.emit({
                id: generateId(),
                sessionId,
                type: 'function_error',
                timestamp: new Date().toISOString(),
                functionName: name,
                parentEventId: eventId,
                error: {
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack || '' : '',
                },
                duration: Date.now() - startTime,
                depth: 0,
            });
            throw error;
        }
    }

    static log(message: string, data?: Record<string, unknown>) {
        const sessionId = sessionManager.getSessionId();
        this.emit({
            id: generateId(),
            sessionId,
            type: 'console_log',
            timestamp: new Date().toISOString(),
            name: message,
            arguments: data ? JSON.stringify(data) : undefined,
            metadata: { message, ...data },
            depth: 0,
        });
    }

    static logWithLocation(
        message: string,
        args: unknown[],
        location: {
            filePath?: string;
            lineNumber?: number;
            columnNumber?: number;
            functionName?: string;
        }
    ) {
        const sessionId = sessionManager.getSessionId();

        // Format data as readable string for display
        const formattedData = args.map(arg => {
            if (typeof arg === 'string') return arg;
            if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
            try {
                return JSON.stringify(arg);
            } catch {
                return String(arg);
            }
        }).join(' ');

        this.emit({
            id: generateId(),
            sessionId,
            type: 'console_log',
            timestamp: new Date().toISOString(),
            name: location.functionName ? `${location.functionName}()` : message,
            functionName: location.functionName,
            filePath: location.filePath,
            lineNumber: location.lineNumber,
            columnNumber: location.columnNumber,
            arguments: JSON.stringify({ message, data: args, formatted: formattedData }),
            metadata: { message, data: args },
            depth: 0,
        });
    }

    static startSession(metadata?: Record<string, unknown>) {
        return sessionManager.startSession(metadata);
    }

    static endSession() {
        sessionManager.endSession();
    }

    static flush() {
        eventQueue.flush();
    }

    private static emit(event: DebugEvent) {
        if (configManager.isInitialized() && configManager.get().enabled !== false) {
            eventQueue.addEvent(event);
        }
    }
}

export * from './decorators/trace';
export * from './types/config.types';
export * from './types/event.types';
export * from './types/decorator.types';
