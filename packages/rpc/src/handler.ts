import { RPCEndpoint } from './client';
import superjson from 'superjson';

export interface RPCHandlerConfig {
  endpoints: RPCEndpoint;
  serializer?: {
    serialize: (data: any) => any;
    deserialize: (data: any) => any;
  };
}

export interface RPCRequest {
  endpoint: string;
  params: any[];
}

export interface RPCResponse {
  data?: any;
  error?: {
    message: string;
    code?: string;
  };
}

export class RPCHandler {
  protected config: RPCHandlerConfig;
  private defaultSerializer = {
    serialize: superjson.serialize,
    deserialize: superjson.deserialize,
  };

  constructor(config: RPCHandlerConfig) {
    this.config = {
      serializer: this.defaultSerializer,
      ...config,
    };
  }

  async handleRequest(request: RPCRequest): Promise<RPCResponse> {
    try {
      const { endpoint, params } = request;
      const handler = this.config.endpoints[endpoint];

      if (!handler) {
        return {
          error: {
            message: `Endpoint '${endpoint}' not found`,
            code: 'ENDPOINT_NOT_FOUND',
          },
        };
      }

      const result = await handler(...params);
      return {
        data: this.config.serializer!.serialize(result),
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'INTERNAL_ERROR',
        },
      };
    }
  }
}
