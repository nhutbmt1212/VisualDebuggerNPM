# VisualDebugger NPM Package

## 📦 Package: `@visual-debugger/sdk`

SDK để debug trực quan TypeScript applications. Cài vào source code của bạn, config API key và theo dõi luồng thực thi trên dashboard.

---

## 🚀 Quick Start

```bash
npm install @visual-debugger/sdk
```

```typescript
import { VisualDebugger, Trace } from '@visual-debugger/sdk';

// 1. Initialize with your API key
VisualDebugger.init({
  apiKey: 'vd_xxxxxxxxxxxx',
  projectName: 'my-app',
  environment: 'development',
  serverUrl: 'https://api.visualdebugger.dev' // or localhost:3001
});

// 2. Use @Trace() decorator on methods you want to debug
class UserService {
  @Trace()
  async getUser(id: string) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
  
  @Trace({ name: 'Create New User' })
  async createUser(data: CreateUserDto) {
    // Your code here
  }
}

// 3. Or use manual tracing
async function fetchProducts() {
  return VisualDebugger.trace('fetchProducts', async () => {
    const res = await fetch('/api/products');
    return res.json();
  });
}
```

---

## 📁 Cấu trúc thư mục

```
VisualDebuggerNPM/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── core/
│   │   ├── config.ts            # Configuration management
│   │   ├── client.ts            # HTTP/WebSocket client
│   │   ├── session.ts           # Debug session management
│   │   └── queue.ts             # Event queue (batch sending)
│   ├── decorators/
│   │   ├── trace.ts             # @Trace() decorator
│   │   ├── debug.ts             # @Debug() decorator
│   │   └── log.ts               # @Log() decorator
│   ├── interceptors/
│   │   ├── fetch.ts             # Global fetch interceptor
│   │   ├── axios.ts             # Axios interceptor
│   │   ├── console.ts           # Console.log interceptor
│   │   └── error.ts             # Error boundary interceptor
│   ├── utils/
│   │   ├── stack-trace.ts       # Parse stack traces
│   │   ├── source-map.ts        # Source map support
│   │   ├── serializer.ts        # Serialize arguments/return values
│   │   └── uuid.ts              # Generate unique IDs
│   └── types/
│       ├── config.types.ts      # Config interfaces
│       ├── event.types.ts       # Debug event types
│       └── decorator.types.ts   # Decorator options
├── tests/
│   ├── decorators.test.ts
│   ├── interceptors.test.ts
│   └── client.test.ts
├── examples/
│   ├── express-app/
│   ├── nextjs-app/
│   └── basic-typescript/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
├── .npmignore
├── .eslintrc.js
├── CHANGELOG.md
└── README.md
```

---

## 📝 Configuration Options

```typescript
interface VisualDebuggerConfig {
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
```

---

## 🎯 API Reference

### `VisualDebugger.init(config)`
Initialize the SDK. Must be called before using any features.

### `VisualDebugger.trace(name, fn)`
Manually trace a function execution.

```typescript
const result = await VisualDebugger.trace('myFunction', async () => {
  // Your code
  return someValue;
});
```

### `VisualDebugger.log(message, data?)`
Send a custom log event.

```typescript
VisualDebugger.log('User logged in', { userId: '123' });
```

### `VisualDebugger.startSession(metadata?)`
Manually start a new debug session.

### `VisualDebugger.endSession()`
End current debug session.

### `VisualDebugger.flush()`
Force send all queued events immediately.

---

## 🏷️ Decorators

### `@Trace(options?)`
Track method execution time, arguments, and return value.

```typescript
class MyService {
  @Trace()
  async getData() { }
  
  @Trace({ name: 'Custom Name', captureArgs: false })
  async sensitiveMethod(password: string) { }
}
```

### `@Debug()`
Add debug breakpoint (only works in development).

### `@Log(message?)`
Log when method is called.

---

## 🔄 Event Types

SDK gửi các loại events sau đến Backend:

| Event Type | Description |
|------------|-------------|
| `session_start` | Debug session started |
| `session_end` | Debug session ended |
| `function_enter` | Function execution started |
| `function_exit` | Function returned |
| `function_error` | Function threw error |
| `http_request` | HTTP request initiated |
| `http_response` | HTTP response received |
| `console_log` | console.log called |
| `error` | Uncaught error |

---

## 🔐 Security

- API key is sent via `X-API-Key` header
- Sensitive data can be redacted using `redactKeys` option
- SDK automatically disabled in production unless explicitly enabled
- No PII is collected by default

---

## 📊 Event Payload

```typescript
interface DebugEvent {
  id: string;
  sessionId: string;
  type: EventType;
  timestamp: string;
  
  // Function tracking
  functionName?: string;
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  
  // Data
  arguments?: any[];
  returnValue?: any;
  error?: {
    message: string;
    stack: string;
  };
  
  // HTTP tracking
  http?: {
    method: string;
    url: string;
    statusCode?: number;
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    requestBody?: any;
    responseBody?: any;
    duration?: number;
  };
  
  // Hierarchy
  parentEventId?: string;
  depth: number;
  
  // Metadata
  duration?: number;
  metadata?: Record<string, any>;
}
```
