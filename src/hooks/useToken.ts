import { useState, useEffect, useCallback } from "react"
import { useTokenContract } from "./useContract"
import { MAX_UINT256 } from "../info/constants"
import { ApprovalState } from "../info/types"
import { Token } from "@uniswap/sdk-core"
import { usePublicClient } from "wagmi"
import { multicall } from "@wagmi/core"
import { ERC20_ABI } from "../info/abi"

interface TokenUtils {
  token: Token | undefined
  tokens: Token[]
  state: ApprovalState
  balance: bigint
  getBalance: () => Promise<void>
  approve: () => Promise<void>
}

const useToken = (
  address?: string,
  owner?: string | null,
  spender?: string
): TokenUtils => {
  const [token, setToken] = useState<Token | undefined>()
  const [state, setState] = useState<ApprovalState>(ApprovalState.NOT_APPROVED)
  const [balance, setBalance] = useState<bigint>(0n)
  const contract = useTokenContract(address)
  const publicClient = usePublicClient()

  const checkAllowance = useCallback(async () => {
    if (!contract || !owner || !spender) return
    const allowance = (await contract.read.allowance([
      owner,
      spender,
    ])) as bigint
    if (allowance)
      setState(
        allowance > 0n ? ApprovalState.APPROVED : ApprovalState.NOT_APPROVED
      )
  }, [contract, owner, spender])

  useEffect(() => {
    const fetch = async () => {
      const p = {
        address: contract?.address as `0x${string}`,
        abi: ERC20_ABI,
      }

      const calls = await multicall({
        chainId: 137,
        contracts: [
          {
            ...p,
            functionName: "decimals",
          },
          {
            ...p,
            functionName: "symbol",
          },
          {
            ...p,
            functionName: "name",
          },
        ],
      })

      const decimals = calls[0].result
      const symbol = calls[1].result as string
      const name = calls[2].result as string

      setToken(
        new Token(
          137,
          contract?.address || "0x0",
          Number(decimals),
          symbol,
          name
        )
      )
    }
    if (contract) fetch()
  }, [contract])

  useEffect(() => {
    if (owner && contract) checkAllowance()
  }, [state, contract, checkAllowance, owner])

  const getBalance = useCallback(async () => {
    if (!contract || !owner) return
    const r = (await contract.read.balanceOf([owner])) as bigint
    setBalance(r)
  }, [contract, owner])

  useEffect(() => {
    const gBalance = async () => {
      const r = (await contract?.read.balanceOf([owner])) as bigint
      setBalance(r)
    }
    if (owner && contract) gBalance()
  }, [contract, owner])

  const approve = useCallback(async () => {
    if (!contract) return
    try {
      setState(ApprovalState.PENDING)
      const hash = await contract.write.approve([spender, MAX_UINT256])
      await publicClient.waitForTransactionReceipt({ hash })
      await checkAllowance()
    } catch (e) {
      console.error(e)
      setState(ApprovalState.ERROR)
    }
  }, [contract, checkAllowance, spender, publicClient])

  return {
    token,
    tokens: [],
    state,
    balance,
    getBalance,
    approve,
  }
}

export default useToken
