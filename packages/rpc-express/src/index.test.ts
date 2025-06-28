import { describe, it, expect, beforeEach } from 'bun:test';
import express, { Express } from 'express';
import request from 'supertest';
import { createRPCRouter, ExpressRPCHandler } from './index';

describe('Express RPC Integration', () => {
  let app: Express;

  const testEndpoints = {
    async ping(): Promise<string> {
      return 'pong';
    },
    async add(a: number, b: number): Promise<number> {
      return a + b;
    },
    async getUser(id: number): Promise<{ id: number; name: string }> {
      return { id, name: `User ${id}` };
    },
    async throwError(): Promise<never> {
      throw new Error('Test error');
    },
    async returnDate(): Promise<Date> {
      return new Date('2024-01-01T00:00:00.000Z');
    },
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('createRPCRouter', () => {
    it('should handle successful RPC calls', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/rpc')
        .send({
          endpoint: 'ping',
          params: [],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.json).toBe('pong');
    });

    it('should handle RPC calls with parameters', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/rpc')
        .send({
          endpoint: 'add',
          params: [5, 3],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.json).toBe(8);
    });

    it('should handle complex return types', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/rpc')
        .send({
          endpoint: 'getUser',
          params: [123],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.json).toEqual({
        id: 123,
        name: 'User 123',
      });
    });

    it('should handle custom path', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
        path: '/api/rpc',
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/api/rpc')
        .send({
          endpoint: 'ping',
          params: [],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.json).toBe('pong');
    });

    it('should return error for non-existent endpoint', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/rpc')
        .send({
          endpoint: 'nonExistent',
          params: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: "Endpoint 'nonExistent' not found",
        code: 'ENDPOINT_NOT_FOUND',
      });
    });

    it('should handle endpoint errors', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/rpc')
        .send({
          endpoint: 'throwError',
          params: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Test error',
        code: 'INTERNAL_ERROR',
      });
    });

    it('should handle invalid request format', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/rpc')
        .send({
          endpoint: 'ping',
          // Missing params array
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toEqual({
        message: 'Invalid RPC request format',
        code: 'INVALID_REQUEST',
      });
    });

    it('should handle malformed JSON', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/rpc')
        .send('invalid json');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_REQUEST');
    });
  });

  describe('ExpressRPCHandler', () => {
    it('should create router with custom configuration', () => {
      const handler = new ExpressRPCHandler({
        endpoints: testEndpoints,
        path: '/custom',
        serializer: {
          serialize: (data) => ({ serialized: data }),
          deserialize: (data) => data.serialized,
        },
      });

      const router = handler.createRouter();
      expect(router).toBeDefined();
    });

    it('should handle date serialization with superjson', async () => {
      const rpcRouter = createRPCRouter({
        endpoints: testEndpoints,
      });

      app.use(rpcRouter);

      const response = await request(app)
        .post('/rpc')
        .send({
          endpoint: 'returnDate',
          params: [],
        });

      expect(response.status).toBe(200);
      // superjson should properly serialize the date
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Middleware usage', () => {
    it('should work as Express middleware', async () => {
      const rpcMiddleware = createRPCRouter({
        endpoints: testEndpoints,
        path: '/api/rpc',
      });

      app.use('/v1', rpcMiddleware);

      const response = await request(app)
        .post('/v1/api/rpc')
        .send({
          endpoint: 'ping',
          params: [],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.json).toBe('pong');
    });
  });
});