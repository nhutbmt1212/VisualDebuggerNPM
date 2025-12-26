export interface VisualDebuggerConfig {
    // Required
    apiKey: string;              // API key từ dashboard

    // Optional
    projectName?: string;        // Tên project (default: package.json name)
    environment?: string;        // 'development' | 'staging' | 'production'
    serverUrl?: string;          // Backend URL (default: https://api.visualdebugger.dev)

    // Features
    enableFetchInterceptor?: boolean;    // Auto-track fetch calls (default: true)
    enableConsoleInterceptor?: boolean;  // Track console.log (default: false)
    enableErrorTracking?: boolean;       // Track uncaught errors (default: true)

    // Performance
    batchSize?: number;          // Events to batch before sending (default: 10)
    flushInterval?: number;      // Flush interval in ms (default: 1000)
    maxQueueSize?: number;       // Max events in queue (default: 100)

    // Privacy
    redactKeys?: string[];       // Keys to redact from logs (default: ['password', 'token', 'secret'])
    enabled?: boolean;           // Enable/disable SDK (default: true in dev, false in prod)
}
