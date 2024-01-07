
import styled from '@emotion/styled'
import { PoolData } from '../../data/poolData'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { Box } from '../primitives'
import { LightCard } from '../Card'

const TooltipWrapper = styled(LightCard)`
  padding: 12px;
  width: 320px;
  opacity: 0.6;
  font-size: 12px;
  z-index: 10;
`

interface CustomToolTipProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartProps: any
  poolData: PoolData
  currentPrice: number | undefined
}

export function CustomToolTip({ chartProps, poolData, currentPrice }: CustomToolTipProps) {
  const price0 = chartProps?.payload?.[0]?.payload.price0
  const price1 = chartProps?.payload?.[0]?.payload.price1
  const tvlToken0 = chartProps?.payload?.[0]?.payload.tvlToken0
  const tvlToken1 = chartProps?.payload?.[0]?.payload.tvlToken1

  return (
    <TooltipWrapper>
      <AutoColumn $gap="sm">
        <Box>Tick stats</Box>
        <RowBetween>
          <Box>{poolData?.token0?.symbol} Price: </Box>
          <Box>
            {price0
              ? Number(price0).toLocaleString(undefined, {
                  minimumSignificantDigits: 1,
                })
              : ''}{' '}
            {poolData?.token1?.symbol}
          </Box>
        </RowBetween>
        <RowBetween>
          <Box>{poolData?.token1?.symbol} Price: </Box>
          <Box>
            {price1
              ? Number(price1).toLocaleString(undefined, {
                  minimumSignificantDigits: 1,
                })
              : ''}{' '}
            {poolData?.token0?.symbol}
          </Box>
        </RowBetween>
        {currentPrice && price0 && currentPrice > price1 ? (
          <RowBetween>
            <Box>{poolData?.token0?.symbol} Locked: </Box>
            <Box>
              {tvlToken0 ?? ''} {poolData?.token0?.symbol}
            </Box>
          </RowBetween>
        ) : (
          <RowBetween>
            <Box>{poolData?.token1?.symbol} Locked: </Box>
            <Box>
              {tvlToken1 ?? ''} {poolData?.token1?.symbol}
            </Box>
          </RowBetween>
        )}
      </AutoColumn>
    </TooltipWrapper>
  )
}

export default CustomToolTip