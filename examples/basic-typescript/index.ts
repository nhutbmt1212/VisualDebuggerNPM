import { VisualDebugger, Trace } from '../../src/index';

// Mock server for local testing if needed
// In this example, we just show how to use the SDK

VisualDebugger.init({
    apiKey: 'vd_test_key_123',
    projectName: 'example-app',
    environment: 'development',
    serverUrl: 'http://localhost:3001',
    enableConsoleInterceptor: true
});

class UserService {
    @Trace({ name: 'GetUser' })
    async getUser(id: string) {
        console.log(`Fetching user with id: ${id}`);
        return { id, name: 'John Doe', email: 'john@example.com' };
    }

    @Trace()
    async processPayment(amount: number) {
        if (amount < 0) {
            throw new Error('Invalid amount');
        }
        return { success: true, transactionId: 'tx_999' };
    }
}

async function runExample() {
    const userService = new UserService();

    try {
        console.log('--- Starting Example ---');

        await userService.getUser('user_1');
        await userService.processPayment(100);

        // Manual trace
        await VisualDebugger.trace('ManualOperation', async () => {
            console.log('Doing some manual work...');
            return 'done';
        });

        // Test error tracking
        try {
            await userService.processPayment(-10);
        } catch (e) {
            // Error is caught and traced by decorator
        }

        console.log('--- Example Finished ---');

        // Force flush events
        VisualDebugger.flush();

    } catch (error) {
        console.error('Example failed:', error);
    }
}

runExample();
