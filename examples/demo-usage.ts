import { VisualDebugger, Trace } from '../src/index';

/**
 * Demo usage of VisualDebugger SDK
 * This script simulates a real application behavior.
 */

// 1. Initialize the SDK
// In a real app, you would get these from environment variables or a config file
VisualDebugger.init({
    apiKey: 'vd_e42c3e27eaae42bc8ab84be225db8b62',
    projectName: 'demo-app',
    environment: 'development',
    serverUrl: 'http://localhost:3001', // Your local backend
    enableConsoleInterceptor: true,      // Capture all console.log calls
    enableFetchInterceptor: true,        // Capture all fetch API calls
});

// 2. Define a class with Tracing decorators
class OrderService {
    @Trace({ name: 'ValidateInventory' })
    async checkStock(productId: string) {
        console.log(`Checking stock for product: ${productId}`);
        // Simulate an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return { available: true, stockCount: 42 };
    }

    @Trace({ name: 'ProcessPayment' })
    async chargeCustomer(amount: number) {
        console.log(`Charging customer: $${amount}`);
        if (amount <= 0) {
            throw new Error('Invalid payment amount: must be greater than zero');
        }
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, txnId: 'txn_mock_123' };
    }
}

// 3. Main execution logic
async function main() {
    console.log('🚀 Starting VisualDebugger Demo...');

    // Start a unique session for this "user"
    const sessionId = VisualDebugger.startSession({
        userId: 'user_99',
        browser: 'NodeJS-Env',
        isPremium: true
    });
    console.log(`Session started: ${sessionId}`);

    const orderService = new OrderService();

    try {
        // Step 1: Successful operations
        const stockStatus = await orderService.checkStock('item-456');
        console.log('Inventory status:', stockStatus);

        const paymentStatus = await orderService.chargeCustomer(150);
        console.log('Payment status:', paymentStatus);

        // Step 2: Manual tracing for a specific block of code
        const report = await VisualDebugger.trace('GenerateInvoice', async () => {
            console.log('Generating PDF invoice...');
            await new Promise(resolve => setTimeout(resolve, 300));
            return { invoiceUrl: 'https://cdn.example.com/inv_123.pdf' };
        });
        console.log('Invoice generated:', report);

        // Step 3: Simulate an error scenario
        console.log('Simulating a failure...');
        await orderService.chargeCustomer(-1);

    } catch (error) {
        console.error('Caught error in main:', error instanceof Error ? error.message : error);
    } finally {
        console.log('🏁 Demo finished. Flushing events to server...');
        VisualDebugger.flush();
        console.log('Done!');
    }
}

main();
