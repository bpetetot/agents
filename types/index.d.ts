export type RateLimit = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    ben: { rateLimits: RateLimit[] }
  }
}
