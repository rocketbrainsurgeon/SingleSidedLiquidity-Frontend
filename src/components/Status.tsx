import { useEffect, useMemo } from "react"
import { Box, Button, Flex, T } from "./primitives"
import { Pool } from "../hooks/useSubgraph"
import { SingleSidedLiquidity } from "../info/types"
import { TICK_SPACINGS, tickToPrice } from "@uniswap/v3-sdk"
import useToken from "../hooks/useToken"
import usePool from "../hooks/usePool"
import { useAccount } from "wagmi"
import { Connect } from "./Connect"
import { SSL_STATUS } from "../hooks/useSingleSidedLiquidity"

const Status = ({
  setSelectedPool,
  pools,
  withdraw,
  ssl,
  fetch,
  status,
  rerange,
}: {
  setSelectedPool: (pool: Pool | undefined) => void
  pools: Pool[]
  withdraw: () => Promise<void>
  ssl: SingleSidedLiquidity | undefined
  fetch: () => Promise<void>
  status: SSL_STATUS
  rerange: () => Promise<void>
}) => {
  const { token: t0 } = useToken(ssl?.token0 as `0x${string}`)
  const { token: t1 } = useToken(ssl?.token1 as `0x${string}`)
  const { pool } = usePool(ssl?.pool as `0x${string}`)
  const { address: account } = useAccount()

  useEffect(() => {
    if (!ssl || !pools) return
    if (ssl.pool) {
      const lc = ssl.pool.toLowerCase()
      const pool = pools.find((p) => p.id.toLowerCase() === lc)
      if (pool) setSelectedPool(pool)
    }
  }, [ssl, pools, setSelectedPool])

  const lastRerangeTimestamp = useMemo(() => {
    if (!ssl?.lastRerange) return
    const d = new Date(Number(ssl.lastRerange * 1000n))
    return d.toLocaleString()
  }, [ssl?.lastRerange])

  const rangeSize = useMemo(() => {
    if (!ssl || !pool) return
    const tickSpacing = TICK_SPACINGS[pool.fee]
    return ssl.rangeSize / tickSpacing
  }, [ssl, pool])

  const sslRange = useMemo(() => {
    if (!pool || !ssl || !t0 || !t1) return
    const upper = tickToPrice(t0, t1, ssl.upper)
    const lower = tickToPrice(t0, t1, ssl.lower)
    const currentPrice = tickToPrice(t0, t1, pool?.tickCurrent)
    const r = {
      [upper.toFixed(6)]: <T key="upper">Upper bound: {upper?.toFixed(6)}</T>,
      [lower.toFixed(6)]: <T key="lower">Lower bound: {lower?.toFixed(6)}</T>,
      [currentPrice.toFixed(6)]: (
        <T key="current">Current price: {currentPrice?.toFixed(6)}</T>
      ),
    }
    const sorted = Object.keys(r).sort((a, b) => {
      return Number(b) - Number(a)
    })
    return <Flex flexDirection="column">{sorted.map((k) => r[k])}</Flex>
  }, [pool, ssl, t0, t1])

  const Buttons = useMemo(() => {
    return (
      <Box marginTop="1rem" width="100%" margin="auto">
        {account ? (
          <Flex flexDirection="column">
            <Button
              disabled={status === SSL_STATUS.PENDING || ssl?.isInRange}
              onClick={rerange}
            >
              {status === SSL_STATUS.PENDING ? "Reranging..." : "Rerange"}
            </Button>
            <Box marginTop="0.5rem">
              <Button
                disabled={status === SSL_STATUS.PENDING}
                onClick={withdraw}
              >
                {status === SSL_STATUS.PENDING ? "Withdrawing..." : "Withdraw"}
              </Button>
            </Box>
          </Flex>
        ) : (
          <Connect />
        )}
      </Box>
    )
  }, [account, withdraw, status, rerange, ssl])

  useEffect(() => {
    const timerId = setInterval(() => {
      fetch()
    }, 30000)

    return () => {
      clearInterval(timerId)
    }
  }, [])

  return (
    <Flex
      marginTop="1rem"
      marginBottom="1rem"
      maxWidth="800px"
      width="100%"
      flexDirection="column"
      justifyContent="center"
      border="1px solid white"
      borderRadius="1rem"
      padding="1rem"
    >
      <Flex width="100%" justifyContent="space-evenly">
        {sslRange}
        <Flex flexDirection="column">
          <T>Last rerange: {lastRerangeTimestamp}</T>
          <T>Is in range: {ssl?.isInRange?.toString()}</T>
          <T>Size of range: {rangeSize?.toString()} tick(s)</T>
        </Flex>
      </Flex>
      {Buttons}
    </Flex>
  )
}

export default Status
