import { VisualDebugger } from '../src/index';

describe('VisualDebugger', () => {
    beforeEach(() => {
        // Initialize SDK before each test
        VisualDebugger.init({
            apiKey: 'test_key_123',
            projectName: 'test-project',
            environment: 'test',
            serverUrl: 'http://localhost:3000',
            enabled: true
        });
    });

    afterEach(() => {
        VisualDebugger.endSession();
    });

    describe('init', () => {
        it('should initialize without errors', () => {
            expect(() => {
                VisualDebugger.init({
                    apiKey: 'test_key',
                    projectName: 'test'
                });
            }).not.toThrow();
        });
    });

    describe('log', () => {
        it('should log a message without errors', () => {
            expect(() => {
                VisualDebugger.log('Test message', { foo: 'bar' });
            }).not.toThrow();
        });
    });

    describe('trace', () => {
        it('should trace a function execution', async () => {
            const result = await VisualDebugger.trace('testFunction', async () => {
                return 'test result';
            });

            expect(result).toBe('test result');
        });

        it('should handle errors in traced functions', async () => {
            await expect(
                VisualDebugger.trace('errorFunction', async () => {
                    throw new Error('Test error');
                })
            ).rejects.toThrow('Test error');
        });
    });

    describe('session management', () => {
        it('should start a new session', () => {
            const sessionId = VisualDebugger.startSession({ test: 'metadata' });
            expect(sessionId).toBeDefined();
            expect(typeof sessionId).toBe('string');
        });

        it('should end a session', () => {
            expect(() => {
                VisualDebugger.endSession();
            }).not.toThrow();
        });
    });

    describe('flush', () => {
        it('should flush events without errors', () => {
            expect(() => {
                VisualDebugger.flush();
            }).not.toThrow();
        });
    });
});
