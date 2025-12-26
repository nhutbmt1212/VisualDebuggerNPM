export type EventType =
    | 'session_start'
    | 'session_end'
    | 'function_enter'
    | 'function_exit'
    | 'function_error'
    | 'http_request'
    | 'http_response'
    | 'console_log'
    | 'error';

export interface DebugEvent {
    id: string;
    sessionId: string;
    type: EventType;
    timestamp: string;

    // Function tracking
    functionName?: string;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;

    // Data
    arguments?: unknown[];
    returnValue?: unknown;
    error?: {
        message: string;
        stack: string;
    };

    // HTTP tracking
    http?: {
        method: string;
        url: string;
        statusCode?: number;
        requestHeaders?: Record<string, string>;
        responseHeaders?: Record<string, string>;
        requestBody?: unknown;
        responseBody?: unknown;
        duration?: number;
    };

    // Hierarchy
    parentEventId?: string;
    depth: number;

    // Metadata
    duration?: number;
    metadata?: Record<string, unknown>;
}
