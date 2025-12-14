export interface SSEConfig {
  endPoint: string;
}

interface IArkHostSSEConstants {
  GAMES: SSEConfig;
}

export const ARK_HOST_SSE_CONSTANTS: IArkHostSSEConstants = {
  GAMES: {
    endPoint: "/sse/games",
  },
} as const satisfies IArkHostSSEConstants;
