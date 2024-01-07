export enum ApprovalState {
  NOT_APPROVED,
  PENDING,
  APPROVED,
  ERROR,
}

export interface Slot0 {
  sqrtPriceX96: bigint
  tick: number
  observationIndex: number
  observationCardinality: number
  observationCardinalityNext: number
  feeProtocol: number
  unlocked: boolean
}

export interface Position {
  liquidity: bigint
  tokensOwed0: bigint
  tokensOwed1: bigint
  feeGrowthInside0LastX128: bigint
  feeGrowthInside1LastX128: bigint
}

export interface SingleSidedLiquidity {
  pool: `0x${string}`
  user: `0x${string}`
  lower: number
  upper: number
  token0: `0x${string}`
  token1: `0x${string}`
  isInRange: boolean
  rangeSize: number
  lastRerange: bigint
  position: readonly [bigint, bigint, bigint, bigint, bigint] | undefined
}
