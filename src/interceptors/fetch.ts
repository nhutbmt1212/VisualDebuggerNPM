import { VisualDebugger } from '../index';

export function setupFetchInterceptor() {
    // Only setup in browser environment
    if (typeof window === 'undefined' || typeof window.fetch === 'undefined') {
        return;
    }

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        const [resource, config] = args;
        const url = typeof resource === 'string' ? resource : (resource as Request).url;
        const method = (config?.method || (resource as Request).method || 'GET').toUpperCase();

        const startTime = Date.now();

        // Emit http_request event
        VisualDebugger.log('HTTP Request', { method, url });

        try {
            const response = await originalFetch(...args);
            const duration = Date.now() - startTime;

            VisualDebugger.log('HTTP Response', {
                method,
                url,
                statusCode: response.status,
                duration
            });

            return response;
        } catch (error) {
            VisualDebugger.log('HTTP Error', {
                method,
                url,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    };
}
