import { NextApiRequest, NextApiResponse } from 'next';
import {
  RPCClient,
  RPCEndpoint,
  RPCHandler,
  RPCHandlerConfig,
} from '@yuankui/rpc';
import superjson from 'superjson';

// Server implementation
export class NextRPCHandler extends RPCHandler {
  constructor(config: RPCHandlerConfig) {
    super({
      ...config,
      serializer: {
        serialize: superjson.serialize,
        deserialize: superjson.deserialize,
      },
    });
  }

  async handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED',
        },
      });
    }

    try {
      const request = req.body;
      const response = await this.handleRequest(request);

      if (response.error) {
        return res.status(400).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        error: {
          message:
            error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}

export function createNextRPCHandler(config: RPCHandlerConfig) {
  const handler = new NextRPCHandler(config);
  return (req: NextApiRequest, res: NextApiResponse) =>
    handler.handler(req, res);
}

// Client implementation
export class NextRPCClient<T extends RPCEndpoint> extends RPCClient<T> {
  constructor(config: { baseUrl?: string } = {}) {
    super({
      url: `${config.baseUrl || ''}/api/rpc`,
      serializer: {
        serialize: superjson.serialize,
        deserialize: superjson.deserialize,
      },
    });
  }
}
