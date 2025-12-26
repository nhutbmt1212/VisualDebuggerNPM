import { DebugEvent } from '../types/event.types';
import { configManager } from './config';
import { client } from './client';

class EventQueue {
    private queue: DebugEvent[] = [];
    private timer: NodeJS.Timeout | null = null;

    addEvent(event: DebugEvent) {
        const config = configManager.get();
        this.queue.push(event);

        if (this.queue.length >= (config.batchSize || 10)) {
            this.flush();
        } else {
            this.startTimer();
        }
    }

    flush() {
        if (this.queue.length === 0) return;

        this.stopTimer();
        const eventsToSend = [...this.queue];
        this.queue = [];
        client.sendEvents(eventsToSend);
    }

    private startTimer() {
        if (this.timer) return;
        const config = configManager.get();
        this.timer = setTimeout(() => {
            this.flush();
        }, config.flushInterval || 1000);
    }

    private stopTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

export const eventQueue = new EventQueue();
