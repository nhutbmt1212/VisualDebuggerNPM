import axios from 'axios';
import { configManager } from './config';
import { DebugEvent } from '../types/event.types';

class Client {
    async sendEvents(events: DebugEvent[]) {
        const config = configManager.get();
        if (!config.enabled) return;

        try {
            await axios.post(`${config.serverUrl}/api/events`, events, {
                headers: {
                    'X-API-Key': config.apiKey,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('[VisualDebugger] Failed to send debug events:', error);
        }
    }
}

export const client = new Client();
