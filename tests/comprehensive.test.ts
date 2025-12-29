import { VisualDebugger } from '../src/index';
import { configManager } from '../src/core/config';
import { sessionManager } from '../src/core/session';
import { eventQueue } from '../src/core/queue';

// Mock the internal modules
jest.mock('../src/core/queue', () => ({
    eventQueue: {
        addEvent: jest.fn(),
        flush: jest.fn(),
    },
}));

describe('VisualDebugger Comprehensive Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('1. Configuration & Initialization', () => {
        it('should correctly initialize with valid configuration', () => {
            VisualDebugger.init({
                apiKey: 'test-api-key',
                projectName: 'test-project',
                enabled: true
            });
            expect(configManager.isInitialized()).toBe(true);
            const config = configManager.get();
            expect(config.apiKey).toBe('test-api-key');
            expect(config.projectName).toBe('test-project');
            expect(config.enabled).toBe(true);
        });

        it('should respect the "enabled" flag', () => {
            VisualDebugger.init({
                apiKey: 'test-key',
                enabled: false
            });

            VisualDebugger.log('Test message when disabled');

            expect(eventQueue.addEvent).not.toHaveBeenCalled();
        });
    });

    describe('General Usage', () => {
        beforeEach(() => {
            VisualDebugger.init({
                apiKey: 'test-api-key',
                projectName: 'test-project',
                enabled: true
            });
            jest.clearAllMocks(); // Clear the "SDK Initialized" log
        });

        describe('2. Event Logging', () => {
            it('should log messages and add them to the queue', () => {
                VisualDebugger.log('Hello World', { extra: 'data' });

                expect(eventQueue.addEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'console_log',
                        metadata: expect.objectContaining({
                            message: 'Hello World',
                            extra: 'data'
                        })
                    })
                );
            });

            it('should handle logging without optional data', () => {
                VisualDebugger.log('Basic message');
                expect(eventQueue.addEvent).toHaveBeenCalled();
            });
        });

        describe('3. Function Tracing', () => {
            it('should trace synchronous-like async function execution', async () => {
                const mockFn = jest.fn().mockResolvedValue('result');
                const result = await VisualDebugger.trace('myFunction', mockFn);

                expect(result).toBe('result');
                // Should call addEvent twice: enter and exit
                expect(eventQueue.addEvent).toHaveBeenCalledTimes(2);

                expect(eventQueue.addEvent).toHaveBeenNthCalledWith(1,
                    expect.objectContaining({ type: 'function_enter', functionName: 'myFunction' })
                );
                expect(eventQueue.addEvent).toHaveBeenNthCalledWith(2,
                    expect.objectContaining({ type: 'function_exit', functionName: 'myFunction', returnValue: 'result' })
                );
            });

            it('should capture errors during tracing', async () => {
                const error = new Error('Function failed');
                const mockFn = jest.fn().mockRejectedValue(error);

                await expect(VisualDebugger.trace('errorFunction', mockFn)).rejects.toThrow('Function failed');

                expect(eventQueue.addEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'function_error',
                        functionName: 'errorFunction',
                        error: expect.objectContaining({
                            message: 'Function failed'
                        })
                    })
                );
            });
        });

        describe('4. Session Management', () => {
            it('should manage sessions correctly', () => {
                const sessionId = VisualDebugger.startSession({ user: 'test-user' });
                expect(sessionId).toBeDefined();
                expect(typeof sessionId).toBe('string');

                VisualDebugger.log('Session log');
                expect(eventQueue.addEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sessionId: sessionId
                    })
                );

                VisualDebugger.endSession();
            });
        });

        describe('5. Batching & Flushing', () => {
            it('should call flush on the event queue', () => {
                VisualDebugger.flush();
                expect(eventQueue.flush).toHaveBeenCalled();
            });
        });
    });
});
