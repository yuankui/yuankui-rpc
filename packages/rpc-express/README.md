# @yuankui/rpc-express

Express integration for @yuankui/rpc - A type-safe RPC framework.

## Installation

```bash
npm install @yuankui/rpc-express
# or
yarn add @yuankui/rpc-express
# or
bun add @yuankui/rpc-express
```

## Usage

### Basic Setup

```typescript
import express from 'express';
import { createRPCRouter } from '@yuankui/rpc-express';

const app = express();
app.use(express.json());

// Define your RPC endpoints
const endpoints = {
  async getUser(id: number) {
    // Your logic here
    return { id, name: 'John Doe' };
  },
  async createUser(name: string, email: string) {
    // Your logic here
    return { id: 1, name, email };
  },
};

// Create RPC router
const rpcRouter = createRPCRouter({
  endpoints,
  path: '/api/rpc', // Optional, defaults to '/rpc'
});

app.use(rpcRouter);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Using with Express Router

```typescript
import { Router } from 'express';
import { createRPCMiddleware } from '@yuankui/rpc-express';

const apiRouter = Router();

const rpcMiddleware = createRPCMiddleware({
  endpoints: {
    async ping() {
      return 'pong';
    },
  },
});

apiRouter.use('/rpc', rpcMiddleware);
```

### Custom Serialization

```typescript
import { createRPCRouter } from '@yuankui/rpc-express';

const rpcRouter = createRPCRouter({
  endpoints: {
    async getData() {
      return new Date(); // Will be properly serialized
    },
  },
  serializer: {
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data),
  },
});
```

## API

### `createRPCRouter(config)`

Creates an Express router with RPC endpoint handling.

#### Parameters

- `config.endpoints` - Object containing your RPC endpoint functions
- `config.path` - (Optional) RPC endpoint path, defaults to `/rpc`
- `config.serializer` - (Optional) Custom serializer, defaults to superjson

#### Returns

Express Router instance

### `createRPCMiddleware(config)`

Alias for `createRPCRouter` for better semantic clarity when using as middleware.

### `ExpressRPCHandler`

Class for more advanced usage scenarios where you need direct control over the handler.

## Client Usage

Use with the standard RPC client:

```typescript
import { RPCClient } from '@yuankui/rpc-express';

type ServerEndpoints = {
  getUser: (id: number) => Promise<{ id: number; name: string }>;
  createUser: (name: string, email: string) => Promise<{ id: number; name: string; email: string }>;
};

const client = new RPCClient<ServerEndpoints>({
  url: 'http://localhost:3000/api/rpc',
});

// Type-safe calls
const user = await client.call('getUser', 123);
const newUser = await client.call('createUser', 'Jane', 'jane@example.com');
```

## License

MIT