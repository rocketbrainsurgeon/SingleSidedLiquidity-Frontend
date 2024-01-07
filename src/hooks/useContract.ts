import { useMemo } from "react"
import {
  UNISWAPPOOL_ABI,
  ERC20_ABI,
  SSL_ABI
} from "../info/abi"
import { getContract } from "viem"
import { useNetwork, usePublicClient, useWalletClient } from "wagmi"

// TODO: Add type for abi
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useContract = (address?: string, abi?: any) => {
  const network = useNetwork()
  const publicClient = usePublicClient({ chainId: network.chain?.id })
  const { data: walletClient } = useWalletClient()

  const contract = useMemo(() => {
    if (!address || !abi || (!publicClient && !walletClient))
      return null

    return getContract({
      address: address as `0x${string}`,
      abi: [...abi] as const,
      publicClient,
      walletClient: walletClient || undefined,
    })
  }, [publicClient, walletClient, abi, address])

  return contract
}

export const useUniswapPoolContract = (address?: string) => {
  return useContract(address, UNISWAPPOOL_ABI)
}

export const useTokenContract = (address?: string) => {
  return useContract(address, ERC20_ABI)
}

export const useSingleSidedLiquidityContract = (address?: string) => {
  return useContract(address, SSL_ABI)
}