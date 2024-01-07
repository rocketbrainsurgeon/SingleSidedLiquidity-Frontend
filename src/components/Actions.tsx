import { useAccount } from "wagmi"
import { Box, Button, Flex, Input, Select, StyledLink, T } from "./primitives"
import { Connect } from "./Connect"
import { useCallback, useMemo, useState } from "react"
import styled from "@emotion/styled"
import { Pool } from "../hooks/useSubgraph"
import {
  ETHERSCAN_URL,
  SSL_CONTRACT_ADDRESS,
  UNISWAP_INFO_URL,
} from "../info/constants"
import { ApprovalState } from "../info/types"
import useToken from "../hooks/useToken"
import { Token } from "@uniswap/sdk-core"
import { SSL_STATUS } from "../hooks/useSingleSidedLiquidity"
import { formatUnits, parseUnits } from "viem"

const Section = styled(Flex)`
  flex-direction: column;
  margin-bottom: 1rem;
`

const Label = styled.label`
  margin-bottom: 0.5rem;
`

const MinWidthButton = styled(Button)`
  min-width: 65px;
  min-height: 35px;
`

const InputContainer = styled(Flex)`
  border-radius: 0.5rem;
  border: 1px solid white;
  padding: 0.5rem;
  background-color: white;
  align-items: center;
`

const Actions = ({
  pools,
  selectedPool,
  setSelectedPool,
  selectedAsset,
  setSelectedAsset,
  range,
  setRange,
  deposit,
  status,
}: {
  pools: Pool[]
  selectedPool: Pool | undefined
  setSelectedPool: (pool: Pool | undefined) => void
  selectedAsset: Token | undefined
  setSelectedAsset: (token: Token | undefined) => void
  range: number
  setRange: (range: number) => void
  deposit: (
    token0: `0x${string}`,
    token1: `0x${string}`,
    fee: number,
    amount0: bigint,
    amount1: bigint,
    ticks: number
  ) => void
  status: SSL_STATUS
}) => {
  const { address } = useAccount()

  const [amount, setAmount] = useState<string | undefined>()
  const {
    token: t0,
    state: t0State,
    balance: t0Balance,
    approve: approveT0,
  } = useToken(
    selectedPool?.token0?.id as `0x${string}`,
    address,
    SSL_CONTRACT_ADDRESS
  )
  const {
    token: t1,
    state: t1State,
    balance: t1Balance,
    approve: approveT1,
  } = useToken(
    selectedPool?.token1?.id as `0x${string}`,
    address,
    SSL_CONTRACT_ADDRESS
  )

  const numbersAndDotOnly = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/^\d*\.?\d*$/.test(event.key) && event.key !== 'Backspace') {
      event.preventDefault()
    }
    const dots = event.currentTarget.value.match(/\./g)
    if (dots && dots.length > 0 && event.key === ".") {
      event.preventDefault()
    }
  }

  const handleSelectPool = (e: string) => {
    const pool = pools.find((pool) => pool.id === e)
    setSelectedPool(pool)
    setSelectedAsset(undefined)
  }

  const handleSelectAsset = (t: Token | undefined) => {
    if (!t) return
    setSelectedAsset(t)
    setAmount("0")
  }

  const selectedBalance = useMemo(() => {
    let b = 0n
    if (t0 && selectedAsset?.equals(t0)) {
      b = t0Balance
    }
    if (t1 && selectedAsset?.equals(t1)) {
      b = t1Balance
    }

    return formatUnits(b, selectedAsset?.decimals || 18)
  }, [selectedAsset, t0, t1, t0Balance, t1Balance])

  const setMax = useCallback(() => {
    if (t0 && selectedAsset?.equals(t0)) {
      setAmount(selectedBalance)
    }
    if (t1 && selectedAsset?.equals(t1)) {
      setAmount(selectedBalance)
    }
  }, [selectedAsset, t0, t1, selectedBalance])

  const Buttons = useMemo(() => {
    if (!address) {
      return <Connect />
    }
    if (!selectedAsset) {
      return <Button disabled>Deposit</Button>
    }
    if (t0State !== ApprovalState.APPROVED && t0 && selectedAsset.equals(t0)) {
      return (
        <Button
          disabled={t0State === ApprovalState.PENDING}
          onClick={() => approveT0()}
        >
          {t0State === ApprovalState.PENDING ? "Approving..." : "Approve"}
        </Button>
      )
    }
    if (t1State !== ApprovalState.APPROVED && t1 && selectedAsset.equals(t1)) {
      return (
        <Button
          disabled={t1State === ApprovalState.PENDING}
          onClick={() => approveT1()}
        >
          {t1State === ApprovalState.PENDING ? "Approving..." : "Approve"}
        </Button>
      )
    }
    return (
      <Button
        disabled={
          !selectedPool ||
          !selectedAsset ||
          !amount ||
          status === SSL_STATUS.PENDING ||
          (t0 &&
            selectedAsset?.equals(t0) &&
            t0Balance < parseUnits(amount, t0.decimals)) ||
          (t1 &&
            selectedAsset?.equals(t1) &&
            t1Balance < parseUnits(amount, t1.decimals))
        }
        onClick={() =>
          deposit(
            t0?.address as `0x${string}`,
            t1?.address as `0x${string}`,
            selectedPool?.feeTier || 0,
            t0 && selectedAsset?.equals(t0)
              ? parseUnits(amount || "0", t0.decimals)
              : 0n,
            t1 && selectedAsset?.equals(t1)
              ? parseUnits(amount || "0", t1.decimals)
              : 0n,
            range
          )
        }
      >
        Deposit
      </Button>
    )
  }, [
    address,
    deposit,
    t0,
    t1,
    range,
    amount,
    selectedAsset,
    t0State,
    t1State,
    approveT0,
    approveT1,
    t0Balance,
    t1Balance,
    selectedPool,
    status,
  ])

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
      <Section>
        <Label>
          <Flex justifyContent="space-between">
            <div>Select Pool</div>
            {selectedPool && (
              <div>
                <StyledLink
                  href={`${ETHERSCAN_URL}/address/${selectedPool?.id}`}
                  target="_blank"
                >
                  Polygonscan
                </StyledLink>
                <span> - </span>
                <StyledLink
                  href={`${UNISWAP_INFO_URL}/${selectedPool?.id}`}
                  target="_blank"
                >
                  Uniswap Analytics
                </StyledLink>
              </div>
            )}
          </Flex>
        </Label>
        <Box>
          <Select
            style={{ width: "100%" }}
            onChange={(e) => handleSelectPool(e.target.value)}
          >
            <option></option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {`${pool.token0.symbol}-${pool.token1.symbol} - ${pool.totalValueLockedUSD} TVL`}
              </option>
            ))}
          </Select>
        </Box>
      </Section>
      <Section>
        <Label>Select Asset</Label>
        <Flex justifyContent="space-evenly">
          <MinWidthButton
            highlight={t0 && selectedAsset?.equals(t0)}
            onClick={() => handleSelectAsset(t0)}
            style={{ width: "auto" }}
          >
            {t0?.symbol || " "}
          </MinWidthButton>
          <MinWidthButton
            highlight={t1 && selectedAsset?.equals(t1)}
            onClick={() => handleSelectAsset(t1)}
            style={{ width: "auto" }}
          >
            {t1?.symbol || " "}
          </MinWidthButton>
        </Flex>
      </Section>
      <Section>
        <Label>Choose range: {`${range} tick(s)`}</Label>
        <Box width="100%">
          <Input
            type="range"
            value={range}
            step="1"
            min="1"
            max="100"
            onChange={(e) => setRange(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </Box>
      </Section>
      <Section>
        <Label>Deposit Amount</Label>
        <InputContainer>
          <Flex flex="0 0 auto">
            <Button onClick={setMax}>MAX</Button>
          </Flex>
          <Flex flex="0 0 auto" paddingLeft="1rem">
            <T color="black">Balance: {selectedBalance}</T>
          </Flex>
          <Flex flex="1">
            <Input
              type="text"
              style={{ width: "100%", textAlign: "right" }}
              placeholder="0.0"
              value={amount}
              onKeyDown={(e) => numbersAndDotOnly(e)}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Flex>
        </InputContainer>
      </Section>

      <Flex
        flexDirection="column"
        justifyContent="center"
        marginTop="1rem"
        width="100%"
      >
        {Buttons}
      </Flex>
    </Flex>
  )
}

export default Actions
