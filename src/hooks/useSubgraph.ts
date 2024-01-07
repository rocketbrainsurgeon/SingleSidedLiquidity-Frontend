import { request, gql } from "graphql-request"
import { UNISWAPV3_GQL_ENDPOINT } from "../info/constants"
import { useCallback, useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"
import { PoolTickData, fetchTicksSurroundingPrice } from "../data/tickData"
import { PoolData, getPoolDatas } from "../data/poolData"

export interface Pool {
  id: string
  totalValueLockedUSD: string
  feeTier: number
  token0: {
    name: string
    id: string
    symbol: string
    decimals: number
  }
  token1: {
    name: string
    id: string
    symbol: string
    decimals: number
  }
}

const fn = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const useSubgraph = (selected: string | undefined) => {
  const isMounted = useIsMounted()
  const [pools, setPools] = useState<Pool[]>([])
  const [poolData, setPoolData] = useState<PoolData | undefined>()
  const [ticks, setTicks] = useState<PoolTickData | undefined>()

  const getTopPools = useCallback(async () => {
    const query = gql`
      {
        pools(first: 20, orderBy: totalValueLockedUSD, orderDirection: desc) {
          id
          totalValueLockedUSD
          feeTier
          token0 {
            name
            id
            symbol
            decimals
          }
          token1 {
            name
            id
            symbol
            decimals
          }
        }
      }
    `
    const data: { pools: Pool[] } = await request(UNISWAPV3_GQL_ENDPOINT, query)
    const formatted = data.pools.map((pool) => {
      return {
        ...pool,
        totalValueLockedUSD: fn.format(Number(pool.totalValueLockedUSD)),
      }
    })
    return { pools: formatted }
  }, [])

  useEffect(() => {
    const f = async () => {
      const { pools } = await getTopPools()
      setPools(pools)
    }
    if (isMounted) f()
  }, [getTopPools, isMounted])

  useEffect(() => {
    const f = async () => {
      if (!selected) return
      setTicks(await fetchTicksSurroundingPrice(selected))
      setPoolData(await getPoolDatas([selected]))
    }
    if (selected) f()
  }, [selected])

  return {
    pools,
    poolData,
    ticks,
  }
}

export default useSubgraph
