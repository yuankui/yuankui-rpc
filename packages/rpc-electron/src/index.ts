import { ipcMain, ipcRenderer } from 'electron';
import {
  RPCClient,
  RPCEndpoint,
  RPCHandler,
  RPCHandlerConfig,
  RPCRequest,
  RPCResponse,
} from '@yuankui/rpc';
import superjson from 'superjson';

// Server implementation
export class ElectronRPCHandler extends RPCHandler {
  constructor(config: RPCHandlerConfig) {
    super({
      ...config,
      serializer: {
        serialize: superjson.serialize,
        deserialize: superjson.deserialize,
      },
    });
  }

  setup() {
    ipcMain.handle(
      'rpc:call',
      async (_, request: RPCRequest): Promise<RPCResponse> => {
        return this.handleRequest(request);
      }
    );
  }
}

export function createElectronRPCHandler(config: RPCHandlerConfig) {
  const handler = new ElectronRPCHandler(config);
  handler.setup();
  return handler;
}

// Client implementation
export class ElectronRPCClient<T extends RPCEndpoint> extends RPCClient<T> {
  constructor() {
    super({
      url: 'electron://rpc',
      serializer: {
        serialize: superjson.serialize,
        deserialize: superjson.deserialize,
      },
    });
  }

  protected async callEndpoint(
    endpoint: string,
    ...params: any[]
  ): Promise<any> {
    try {
      const response = await ipcRenderer.invoke('rpc:call', {
        endpoint,
        params,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during RPC call');
    }
  }

  async call<K extends keyof T>(
    endpoint: K,
    ...params: Parameters<T[K]>
  ): Promise<Awaited<ReturnType<T[K]>>> {
    return this.callEndpoint(endpoint as string, ...params);
  }
}
