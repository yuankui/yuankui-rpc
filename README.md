# @yuankui/rpc

A type-safe RPC (Remote Procedure Call) framework for TypeScript, designed for building robust and maintainable APIs. It leverages `superjson` for seamless serialization of complex data types and provides adapters for various environments like Electron and Next.js.

## Features

- **Type-Safe**: End-to-end type safety for your API calls.
- **`superjson` Integration**: Natively supports complex data types like `Date`, `Map`, `Set`, etc.
- **Environment Agnostic**: Core package works in any Node.js environment.
- **Lightweight**: Minimal dependencies and a small footprint.

## Packages

This is a monorepo containing the following packages:

| Package                  | Description                               |
| ------------------------ | ----------------------------------------- |
| `@yuankui/rpc`           | Core RPC framework                        |


## Installation

Install the desired packages using your favorite package manager:

```bash
bun add @yuankui/rpc
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
