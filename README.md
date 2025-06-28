# @yuankui/rpc

A type-safe RPC (Remote Procedure Call) framework for TypeScript, designed for building robust and maintainable APIs. It leverages `superjson` for seamless serialization of complex data types and provides adapters for various environments like Electron and Next.js.

## Features

- **Type-Safe**: End-to-end type safety for your API calls.
- **`superjson` Integration**: Natively supports complex data types like `Date`, `Map`, `Set`, etc.
- **Environment Agnostic**: Core package works in any Node.js environment.
- **Adapters**: Official adapters for Electron and Next.js.
- **Lightweight**: Minimal dependencies and a small footprint.

## Packages

This is a monorepo containing the following packages:

| Package                  | Description                               |
| ------------------------ | ----------------------------------------- |
| `@yuankui/rpc`           | Core RPC framework                        |
| `@yuankui/rpc-electron`  | Adapter for Electron applications         |
| `@yuankui/rpc-nextjs`    | Adapter for Next.js applications          |

## Installation

Install the desired packages using your favorite package manager:

```bash
bun add @yuankui/rpc
bun add @yuankui/rpc-electron # For Electron
bun add @yuankui/rpc-nextjs   # For Next.js
```

## Usage

### Core (`@yuankui/rpc`)

The core package provides the `RPCClient` and `RPCHandler` classes.

**1. Define your API**

First, define the procedures you want to expose. This can be done in a shared file.

```typescript
// shared/api.ts
export type API = {
  add: (a: number, b: number) => Promise<number>;
  getUser: (id: string) => Promise<{ id: string; name: string }>;
};
```

**2. Create a handler**

On the server, create a handler to implement the API.

```typescript
// server.ts
import { RPCHandler } from '@yuankui/rpc';
import { API } from './shared/api';

const apiImpl: API = {
  add: async (a, b) => a + b,
  getUser: async (id) => ({ id, name: `User ${id}` }),
};

const handler = new RPCHandler({
  endpoints: apiImpl,
});

// Now, integrate the handler with your server (e.g., Express, Fastify).
```

**3. Create a client**

On the client, create a client to call the API.

```typescript
// client.ts
import { RPCClient } from '@yuankui/rpc';
import { API } from './shared/api';

const client = new RPCClient<API>({
  url: 'http://localhost:3000/rpc', // Your server URL
});

async function main() {
  const sum = await client.call('add', 2, 3);
  console.log(sum); // 5

  const user = await client.call('getUser', '123');
  console.log(user); // { id: '123', name: 'User 123' }
}

main();
```

### Electron (`@yuankui/rpc-electron`)

This package simplifies RPC in Electron applications.

**1. Main Process (Handler)**

In your main process, create a handler.

```typescript
// main.ts
import { app, BrowserWindow } from 'electron';
import { createElectronRPCHandler } from '@yuankui/rpc-electron';
import { API } from './shared/api';

const apiImpl: API = {
  add: async (a, b) => a + b,
  getUser: async (id) => ({ id, name: `User ${id}` }),
};

createElectronRPCHandler({ endpoints: apiImpl });

// Your Electron app setup...
```

**2. Renderer Process (Client)**

In your renderer process, create a client.

```typescript
// renderer.ts
import { ElectronRPCClient } from '@yuankui/rpc-electron';
import { API } from './shared/api';

const client = new ElectronRPCClient<API>();

async function main() {
  const sum = await client.call('add', 5, 10);
  console.log(sum); // 15
}

main();
```

### Next.js (`@yuankui/rpc-nextjs`)

This package provides a Next.js API route handler.

**1. API Route (Handler)**

Create an API route to handle RPC calls.

```typescript
// pages/api/rpc.ts
import { createNextRPCHandler } from '@yuankui/rpc-nextjs';
import { API } from '../../shared/api';

const apiImpl: API = {
  add: async (a, b) => a + b,
  getUser: async (id) => ({ id, name: `User ${id}` }),
};

export default createNextRPCHandler({ endpoints: apiImpl });
```

**2. Client Component (Client)**

In your client-side code, create a client.

```typescript
// components/MyComponent.tsx
import { NextRPCClient } from '@yuankui/rpc-nextjs';
import { API } from '../shared/api';
import { useEffect, useState } from 'react';

const client = new NextRPCClient<API>();

export default function MyComponent() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    client.call('getUser', '1').then(setUser);
  }, []);

  return <div>{user ? `Hello, ${user.name}` : 'Loading...'}</div>;
}
```

## API Reference

### `RPCClient<T>`

- `constructor(config: RPCClientConfig)`
- `call<K extends keyof T>(endpoint: K, ...params: Parameters<T[K]>): Promise<Awaited<ReturnType<T[K]>>>`
- `updateConfig(config: Partial<RPCClientConfig>)`

### `RPCHandler`

- `constructor(config: RPCHandlerConfig)`

### Environment-Specific Classes

- `ElectronRPCClient<T>` / `createElectronRPCHandler`
- `NextRPCClient<T>` / `createNextRPCHandler`

Refer to the source code for detailed API information.

## License

This project is licensed under the MIT License.
