import { generateId } from '../utils/uuid';

class SessionManager {
    private sessionId: string | null = null;

    startSession(_metadata?: Record<string, unknown>) {
        this.sessionId = generateId();
        // In a real implementation, we would also emit a session_start event here
        return this.sessionId;
    }

    getSessionId(): string {
        if (!this.sessionId) {
            this.sessionId = this.startSession();
        }
        return this.sessionId;
    }

    endSession() {
        this.sessionId = null;
    }
}

export const sessionManager = new SessionManager();
