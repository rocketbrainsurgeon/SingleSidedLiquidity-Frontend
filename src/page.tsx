import { useMemo, useState } from "react"
import Actions from "./components/Actions"
import Status from "./components/Status"
import { Flex } from "./components/primitives"
import useSingleSidedLiquidity from "./hooks/useSingleSidedLiquidity"
import useSubgraph, { Pool } from "./hooks/useSubgraph"
import LiquidityProfile from "./components/LiquidityProfile"
import { SSL_CONTRACT_ADDRESS } from "./info/constants"
import { Token } from "@uniswap/sdk-core"
import { FeeAmount, TICK_SPACINGS, TickMath } from "@uniswap/v3-sdk"
import JSBI from "jsbi"

const Page = () => {
  const [selectedPool, setSelectedPool] = useState<Pool | undefined>()
  const [range, setRange] = useState(1)
  const [selectedAsset, setSelectedAsset] = useState<Token | undefined>()
  const { poolData, pools } = useSubgraph(selectedPool?.id)
  const { ssl, deposit, withdraw, fetch, status, rerange } =
    useSingleSidedLiquidity(SSL_CONTRACT_ADDRESS)

  const [lower, upper] = useMemo(() => {
    if (ssl?.position && ssl.position[0] > 0n) {
      return [
        TickMath.getSqrtRatioAtTick(ssl.lower),
        TickMath.getSqrtRatioAtTick(ssl.upper),
      ]
    }
    if (!selectedAsset || !poolData) return [JSBI.BigInt(0), JSBI.BigInt(0)]
    const tick = poolData?.tick
    const tickSpacing = TICK_SPACINGS[poolData.feeTier as FeeAmount]
    const rangeSize = tickSpacing * range
    if (
      selectedAsset.address.toLowerCase() ===
      poolData.token1.address.toLowerCase()
    ) {
      return [
        TickMath.getSqrtRatioAtTick(tick - rangeSize),
        TickMath.getSqrtRatioAtTick(tick - tickSpacing),
      ]
    }
    return [
      TickMath.getSqrtRatioAtTick(tick),
      TickMath.getSqrtRatioAtTick(tick + rangeSize),
    ]
  }, [range, selectedAsset, poolData, ssl])

  return (
    <Flex
      width="100%"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
    >
      <LiquidityProfile
        poolData={poolData}
        ssl={ssl}
        lower={lower}
        upper={upper}
      />
      {ssl?.position && ssl.position[0] > 0n ? (
        <Status
          setSelectedPool={setSelectedPool}
          pools={pools}
          withdraw={withdraw}
          ssl={ssl}
          fetch={fetch}
          status={status}
          rerange={rerange}
        />
      ) : (
        <Actions
          pools={pools}
          selectedPool={selectedPool}
          setSelectedPool={setSelectedPool}
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
          range={range}
          setRange={setRange}
          deposit={deposit}
          status={status}
        />
      )}
    </Flex>
  )
}

export default Page
