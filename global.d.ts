export {};

declare global {
  interface Window {
    grecaptcha: {
      ready(cb: () => void): void;
      render(
        container: string | HTMLElement,
        parameters: {
          sitekey: string;
          theme?: string;
        },
      ): number;
      reset(widgetId?: number): void;
      getResponse(widgetId?: number): string;
    };
  }
}

declare module 'pg' {
  export interface PoolConfig {
    [key: string]: any;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<T = any>(
      query: string | { text: string; values?: any[] },
      values?: any[],
    ): Promise<{ rows: T[] }>;
    on(event: 'error', listener: (err: any) => void): void;
  }

  const pg: {
    Pool: typeof Pool;
  };

  export default pg;
}

