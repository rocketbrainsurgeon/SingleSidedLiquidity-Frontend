import request, { gql } from "graphql-request"
import { UNISWAPV3_GQL_ENDPOINT } from "../info/constants"

export interface PoolData {
  // basic token info
  address: string
  feeTier: number

  token0: {
    name: string
    symbol: string
    address: string
    decimals: number
    derivedETH: number
  }

  token1: {
    name: string
    symbol: string
    address: string
    decimals: number
    derivedETH: number
  }

  // for tick math
  liquidity: number
  sqrtPrice: number
  tick: number

  // volume
  volumeUSD: number

  // liquidity
  tvlUSD: number

  // prices
  token0Price: number
  token1Price: number

  // token amounts
  tvlToken0: number
  tvlToken1: number
}

export const POOLS_BULK = (block: number | undefined, pools: string[]) => {
  let poolString = `[`
  pools.map((address) => {
    return (poolString += `"${address}",`)
  })
  poolString += "]"
  const queryString =
    gql`
    query pools {
      pools(where: {id_in: ${poolString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
        id
        feeTier
        liquidity
        sqrtPrice
        tick
        token0 {
            id
            symbol 
            name
            decimals
            derivedETH
        }
        token1 {
            id
            symbol 
            name
            decimals
            derivedETH
        }
        token0Price
        token1Price
        volumeUSD
        volumeToken0
        volumeToken1
        txCount
        totalValueLockedToken0
        totalValueLockedToken1
        totalValueLockedUSD
      }
      bundles (where: {id: "1"}) {
        ethPriceUSD
      }
    }
    `
  return queryString
}

interface PoolFields {
  id: string
  feeTier: string
  liquidity: string
  sqrtPrice: string
  tick: string
  token0: {
    id: string
    symbol: string
    name: string
    decimals: string
    derivedETH: string
  }
  token1: {
    id: string
    symbol: string
    name: string
    decimals: string
    derivedETH: string
  }
  token0Price: string
  token1Price: string
  volumeUSD: string
  volumeToken0: string
  volumeToken1: string
  txCount: string
  totalValueLockedToken0: string
  totalValueLockedToken1: string
  totalValueLockedUSD: string
}

interface PoolDataResponse {
  pools: PoolFields[]
  bundles: {
    ethPriceUSD: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export const getPoolDatas = async (
  poolAddresses: string[]
): Promise<PoolData> => {
  const q = POOLS_BULK(undefined, poolAddresses)
  const data: PoolDataResponse = await request(UNISWAPV3_GQL_ENDPOINT, q)

  const ethPriceUSD = data?.bundles?.[0]?.ethPriceUSD
    ? parseFloat(data?.bundles?.[0]?.ethPriceUSD)
    : 0

  const parsed = data?.pools
    ? data.pools.reduce(
        (accum: { [address: string]: PoolFields }, poolData) => {
          accum[poolData.id] = poolData
          return accum
        },
        {}
      )
    : {}

  // format data and calculate daily changes
  const formatted = poolAddresses.reduce(
    (accum: { [address: string]: PoolData }, address) => {
      const current: PoolFields | undefined = parsed[address]

      const volumeUSD = current ? parseFloat(current.volumeUSD) : 0

      // Hotifx: Subtract fees from TVL to correct data while subgraph is fixed.
      /**
       * Note: see issue desribed here https://github.com/Uniswap/v3-subgraph/issues/74
       * During subgraph deploy switch this month we lost logic to fix this accounting.
       * Grafted sync pending fix now.
       */
      const feePercent = current ? parseFloat(current.feeTier) / 10000 / 100 : 0
      const tvlAdjust0 = current?.volumeToken0
        ? (parseFloat(current.volumeToken0) * feePercent) / 2
        : 0
      const tvlAdjust1 = current?.volumeToken1
        ? (parseFloat(current.volumeToken1) * feePercent) / 2
        : 0
      const tvlToken0 = current
        ? parseFloat(current.totalValueLockedToken0) - tvlAdjust0
        : 0
      const tvlToken1 = current
        ? parseFloat(current.totalValueLockedToken1) - tvlAdjust1
        : 0
      let tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0

      // Part of TVL fix
      const tvlUpdated = current
        ? tvlToken0 * parseFloat(current.token0.derivedETH) * ethPriceUSD +
          tvlToken1 * parseFloat(current.token1.derivedETH) * ethPriceUSD
        : undefined
      if (tvlUpdated) {
        tvlUSD = tvlUpdated
      }

      const feeTier = current ? parseInt(current.feeTier) : 0

      if (current) {
        accum[address] = {
          address,
          feeTier,
          liquidity: parseFloat(current.liquidity),
          sqrtPrice: parseFloat(current.sqrtPrice),
          tick: parseFloat(current.tick),
          token0: {
            address: current.token0.id,
            name: current.token0.name,
            symbol: current.token0.symbol,
            decimals: parseInt(current.token0.decimals),
            derivedETH: parseFloat(current.token0.derivedETH),
          },
          token1: {
            address: current.token1.id,
            name: current.token1.name,
            symbol: current.token1.symbol,
            decimals: parseInt(current.token1.decimals),
            derivedETH: parseFloat(current.token1.derivedETH),
          },
          token0Price: parseFloat(current.token0Price),
          token1Price: parseFloat(current.token1Price),
          volumeUSD,
          tvlUSD,
          tvlToken0,
          tvlToken1,
        }
      }

      return accum
    },
    {}
  )

  return formatted[poolAddresses[0]]
}
