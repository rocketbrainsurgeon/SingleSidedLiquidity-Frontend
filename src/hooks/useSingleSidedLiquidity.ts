import { useCallback, useEffect, useRef, useState } from "react"
import { SSL_ABI } from "../info/abi"
import { useSingleSidedLiquidityContract } from "./useContract"
import { multicall } from "@wagmi/core"
import { useAccount, useNetwork, usePublicClient } from "wagmi"
import { useIsMounted } from "./useIsMounted"
import { SingleSidedLiquidity } from "../info/types"

export enum SSL_STATUS {
  UNINITIALIZED,
  PENDING,
  READY,
}

const useSingleSidedLiquidity = (address: `0x${string}`) => {
  const contract = useSingleSidedLiquidityContract(address)
  const network = useNetwork()
  const isMounted = useIsMounted()
  const publicClient = usePublicClient()
  const { address: account } = useAccount()
  const didFetch = useRef(false)

  const [ssl, setSsl] = useState<SingleSidedLiquidity | undefined>()
  const [status, setStatus] = useState<SSL_STATUS>(SSL_STATUS.UNINITIALIZED)

  const fetch = useCallback(async () => {
    didFetch.current = true
    const p = {
      address: address as `0x${string}`,
      abi: SSL_ABI,
    }

    const calls = await multicall({
      chainId: network.chain?.id,
      contracts: [
        {
          ...p,
          functionName: "pool",
        },
        {
          ...p,
          functionName: "user",
        },
        {
          ...p,
          functionName: "lower",
        },
        {
          ...p,
          functionName: "upper",
        },
        {
          ...p,
          functionName: "token0",
        },
        {
          ...p,
          functionName: "token1",
        },
        {
          ...p,
          functionName: "lastRerange",
        },
        {
          ...p,
          functionName: "isInRange",
        },
        {
          ...p,
          functionName: "rangeSize",
        },
        {
          ...p,
          functionName: "getPosition",
        },
      ],
    })

    const pool = calls[0].result as `0x${string}`
    const user = calls[1].result as `0x${string}`
    const lower = calls[2].result as number
    const upper = calls[3].result as number
    const token0 = calls[4].result as `0x${string}`
    const token1 = calls[5].result as `0x${string}`
    const lastRerange = calls[6].result as bigint
    const isInRange = calls[7].result as boolean
    const rangeSize = calls[8].result as number
    const position = calls[9].result

    setSsl((prev) => {
      return {
        ...prev,
        pool,
        user,
        lower,
        upper,
        token0,
        token1,
        lastRerange,
        isInRange,
        rangeSize,
        position,
      }
    })
    setStatus(SSL_STATUS.READY)
  }, [address, network])

  useEffect(() => {
    if (!didFetch.current && isMounted && address && network && contract)
      fetch()
  }, [isMounted, contract, address, network, fetch])

  const deposit = useCallback(
    async (
      t0: `0x${string}`,
      t1: `0x${string}`,
      fee: number,
      amount0: bigint,
      amount1: bigint,
      ticks: number
    ) => {
      if (!contract || !account) return
      try {
        setStatus(SSL_STATUS.PENDING)
        const gas = await publicClient.estimateContractGas({
          address,
          abi: SSL_ABI,
          functionName: "deposit",
          args: [t0, t1, fee, amount0, amount1, ticks],
          account,
        })
        const hash = await contract.write.deposit(
          [t0, t1, fee, amount0, amount1, ticks],
          {
            gas,
          }
        )
        await publicClient.waitForTransactionReceipt({ hash })
        await fetch()
      } catch (e) {
        console.log(e)
      } finally {
        setStatus(SSL_STATUS.READY)
      }
    },
    [contract, publicClient, account, address, fetch]
  )

  const withdraw = useCallback(async () => {
    if (!contract || !account) return
    try {
      setStatus(SSL_STATUS.PENDING)
      const gas = await publicClient.estimateContractGas({
        address,
        abi: SSL_ABI,
        functionName: "withdraw",
        account,
      })
      const hash = await contract.write.withdraw([], { gas })
      await publicClient.waitForTransactionReceipt({ hash })
      await fetch()
    } catch (e) {
      console.log(e)
    } finally {
      setStatus(SSL_STATUS.READY)
    }
  }, [contract, publicClient, address, account, fetch])

  const rerange = useCallback(async () => {
    if (!contract || !account) return
    try {
      setStatus(SSL_STATUS.PENDING)
      const gas = await publicClient.estimateContractGas({
        address,
        abi: SSL_ABI,
        functionName: "rerange",
        account,
      })
      const hash = await contract.write.rerange([], { gas })
      await publicClient.waitForTransactionReceipt({ hash })
      await fetch()
    } catch (e) {
      console.log(e)
    } finally {
      setStatus(SSL_STATUS.READY)
    }
  }, [contract, publicClient, address, account, fetch])

  return {
    ssl,
    deposit,
    withdraw,
    rerange,
    fetch,
    status,
  }
}

export default useSingleSidedLiquidity
