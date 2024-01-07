import styled from "@emotion/styled"
import DensityChart from "./DensityChart"
import { Flex } from "./primitives"
import { PoolData } from "../data/poolData"
import { SingleSidedLiquidity } from "../info/types"
import JSBI from "jsbi"

const Container = styled(Flex)`
  background-color: ${(props) => props.theme.colors.chartBackground};
  border-radius: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  max-width: 800px;
`

const LiquidityProfile = ({
  poolData,
  ssl,
  lower,
  upper,
}: {
  poolData: PoolData | undefined
  ssl: SingleSidedLiquidity | undefined
  lower: JSBI
  upper: JSBI
}) => {
  return (
    <Container
      width="100%"
      height="400px"
      alignItems="center"
      justifyContent="center"
      margin="auto"
    >
      {poolData && (
        <DensityChart
          poolData={poolData}
          ssl={ssl}
          lower={lower}
          upper={upper}
        />
      )}
    </Container>
  )
}

export default LiquidityProfile
