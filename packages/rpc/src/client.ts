import superjson from 'superjson';
import { RPCResponse } from './handler';

export type RPCEndpoint = {
  [key: string]: (...args: any[]) => Promise<any>;
};

export interface RPCClientConfig {
  url: string;
  timeout?: number;
  headers?: Record<string, string>;
  serializer?: {
    serialize: (data: any) => any;
    deserialize: (data: any) => any;
  };
}

export class RPCClient<T extends RPCEndpoint> {
  private config: RPCClientConfig;
  private defaultSerializer = {
    serialize: superjson.serialize,
    deserialize: superjson.deserialize,
  };

  constructor(config: RPCClientConfig) {
    this.config = {
      timeout: 30000,
      headers: {},
      serializer: this.defaultSerializer,
      ...config,
    };
  }

  /**
   * Call a remote procedure
   * @param endpoint The endpoint to call
   * @param params The parameters to pass to the endpoint
   * @returns The result of the remote procedure call
   */
  async call<K extends keyof T>(
    endpoint: K,
    ...params: Parameters<T[K]>
  ): Promise<Awaited<ReturnType<T[K]>>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify({
          endpoint,
          params,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`RPC call failed: ${response.statusText}`);
      }

      const result = (await response.json()) as RPCResponse;
      if (result.error) {
        throw new Error(result.error.message);
      }
      return this.config.serializer!.deserialize(result.data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`RPC call timed out after ${this.config.timeout}ms`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred during RPC call');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Update the client configuration
   * @param config Partial configuration to update
   */
  updateConfig(config: Partial<RPCClientConfig>) {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
