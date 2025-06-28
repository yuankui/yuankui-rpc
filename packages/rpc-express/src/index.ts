import { Request, Response, Router } from 'express';
import { RPCHandler, RPCHandlerConfig, RPCRequest, RPCResponse } from '@yuankui/rpc';
import superjson from 'superjson';

export interface ExpressRPCConfig extends Omit<RPCHandlerConfig, 'serializer'> {
  path?: string;
  serializer?: {
    serialize: (data: any) => any;
    deserialize: (data: any) => any;
  };
}

export class ExpressRPCHandler extends RPCHandler {
  private path: string;

  constructor(config: ExpressRPCConfig) {
    const handlerConfig: RPCHandlerConfig = {
      ...config,
      serializer: config.serializer || {
        serialize: superjson.serialize,
        deserialize: superjson.deserialize,
      },
    };
    
    super(handlerConfig);
    this.path = config.path || '/rpc';
  }

  createRouter(): Router {
    const router = Router();

    router.post(this.path, async (req: Request, res: Response) => {
      try {
        const request: RPCRequest = req.body;
        
        if (!request.endpoint || !Array.isArray(request.params)) {
          return res.status(400).json({
            error: {
              message: 'Invalid RPC request format',
              code: 'INVALID_REQUEST',
            },
          });
        }

        const response: RPCResponse = await this.handleRequest(request);
        
        if (response.error) {
          return res.status(400).json(response);
        }

        res.json({ data: response.data });
      } catch (error) {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        });
      }
    });

    return router;
  }

  createMiddleware() {
    return this.createRouter();
  }
}

export function createRPCRouter(config: ExpressRPCConfig): Router {
  const handler = new ExpressRPCHandler(config);
  return handler.createRouter();
}

export function createRPCMiddleware(config: ExpressRPCConfig) {
  return createRPCRouter(config);
}

export * from '@yuankui/rpc';