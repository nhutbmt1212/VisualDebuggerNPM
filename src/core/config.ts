import { VisualDebuggerConfig } from '../types/config.types';

const DEFAULT_CONFIG: Partial<VisualDebuggerConfig> = {
    apiKey: typeof process !== 'undefined' ? process.env?.VD_API_KEY : undefined,
    projectName: (typeof process !== 'undefined' ? process.env?.VD_PROJECT_NAME : undefined) || 'unnamed-project',
    environment: (typeof process !== 'undefined' ? process.env?.VD_ENVIRONMENT : undefined) || 'development',
    serverUrl: 'http://localhost:3001',
    enableFetchInterceptor: true,
    enableConsoleInterceptor: false,
    enableErrorTracking: true,
    batchSize: 10,
    flushInterval: 1000,
    maxQueueSize: 100,
    redactKeys: ['password', 'token', 'secret'],
    enabled: true,
};

class ConfigManager {
    private config: VisualDebuggerConfig | null = null;

    init(config: VisualDebuggerConfig) {
        this.config = { ...DEFAULT_CONFIG, ...config } as VisualDebuggerConfig;
    }

    get(): VisualDebuggerConfig {
        if (!this.config) {
            throw new Error('VisualDebugger not initialized. Call VisualDebugger.init() first.');
        }
        return this.config;
    }

    isInitialized(): boolean {
        return this.config !== null;
    }
}

export const configManager = new ConfigManager();
