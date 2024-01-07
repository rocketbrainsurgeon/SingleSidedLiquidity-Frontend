import { useState, useEffect, useRef } from "react"
import { useUniswapPoolContract } from "./useContract"
import { Position, Slot0 } from "../info/types"

import { FeeAmount, Pool } from "@uniswap/v3-sdk"
import useToken from "./useToken"
import { UNISWAPPOOL_ABI } from "../info/abi"
import { multicall } from "@wagmi/core"
import { useIsMounted } from "./useIsMounted"
import { encodePacked, keccak256 } from "viem"
import { useNetwork } from "wagmi"

interface PoolData {
  slot0: Slot0
  fee: FeeAmount
  liquidity: string
  token0: `0x${string}`
  token1: `0x${string}`
}

const usePool = (address?: string) => {
  const network = useNetwork()
  const contract = useUniswapPoolContract(address)
  const [poolData, setPoolData] = useState<PoolData | undefined>()
  const [pool, setPool] = useState<Pool | undefined>()
  const isMounted = useIsMounted()
  const { token: t0 } = useToken(poolData?.token0)
  const { token: t1 } = useToken(poolData?.token1)
  const loaded = useRef(false)

  useEffect(() => {
    const fetch = async () => {
      if (loaded.current) return
      loaded.current = true
      const p = {
        address: address as `0x${string}`,
        abi: UNISWAPPOOL_ABI,
      }

      const calls = await multicall({
        chainId: network.chain?.id,
        contracts: [
          {
            ...p,
            functionName: "slot0",
          },
          {
            ...p,
            functionName: "liquidity",
          },
          {
            ...p,
            functionName: "fee",
          },
          {
            ...p,
            functionName: "token0",
          },
          {
            ...p,
            functionName: "token1",
          },
        ],
      })

      const result = calls[0].result
      const slot0 = result
        ? {
            sqrtPriceX96: result[0],
            tick: result[1],
            observationIndex: result[2],
            observationCardinality: result[3],
            observationCardinalityNext: result[4],
            feeProtocol: result[5],
            unlocked: result[6],
          }
        : {
            sqrtPriceX96: 0n,
            tick: 0,
            observationIndex: 0,
            observationCardinality: 0,
            observationCardinalityNext: 0,
            feeProtocol: 0,
            unlocked: false,
          }
      const liquidity = calls[1].result
      const fee = calls[2].result || FeeAmount.LOWEST
      setPoolData({
        slot0,
        liquidity: liquidity?.toString() || "",
        fee,
        token0: calls[3].result as `0x${string}`,
        token1: calls[4].result as `0x${string}`,
      })
    }
    if (isMounted && !loaded.current && address && network && contract) fetch()
  }, [isMounted, contract, address, network])

  useEffect(() => {
    if (poolData && t0 && t1) {
      setPool(
        new Pool(
          t0,
          t1,
          poolData.fee,
          poolData.slot0.sqrtPriceX96.toString(),
          poolData.liquidity,
          poolData.slot0.tick
        )
      )
    }
  }, [poolData, t0, t1])

  const getPosition = async (
    owner: string,
    lower: bigint,
    upper: bigint
  ): Promise<Position> => {
    const str = keccak256(
      encodePacked(
        ["address", "int24", "int24"],
        [owner as `0x${string}`, Number(lower), Number(upper)]
      )
    )
    const r = (await contract?.read.positions([str])) as bigint[]

    const position = {
      liquidity: r[0],
      tokensOwed0: r[1],
      tokensOwed1: r[2],
      feeGrowthInside0LastX128: r[3],
      feeGrowthInside1LastX128: r[4],
    } as Position

    return position
  }

  return {
    getPosition,
    pool,
  }
}

export default usePool
