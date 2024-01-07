/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartEntry } from './index'
import { PoolData } from '../../data/poolData'
import styled from '@emotion/styled'
import { Box } from '../primitives'
import { AutoColumn } from '../Column'
import { RowFixed } from '../Row'
import theme from '../../theme'

const Wrapper = styled.div`
  border-radius: 8px;
  padding: 6px 12px;
  color: white;
  width: fit-content;
  font-size: 14px;
  background-color: ${props => props.theme.colors.background};
`

interface LabelProps {
  x: number
  y: number
  index: number
}

interface CurrentPriceLabelProps {
  data: ChartEntry[] | undefined
  chartProps: any
  poolData: PoolData
}

export function CurrentPriceLabel({ data, chartProps, poolData }: CurrentPriceLabelProps) {
  const labelData = chartProps as LabelProps
  const entryData = data?.[labelData.index]
  if (entryData?.isCurrent) {
    const price0 = entryData.price0
    const price1 = entryData.price1
    return (
      <g>
        <foreignObject x={labelData.x - 80} y={318} width={'100%'} height={100}>
          <Wrapper>
            <AutoColumn $gap="6px">
              <RowFixed align="center">
                <Box marginRight="6px">Current Price</Box>
                <div
                  style={{
                    marginTop: '2px',
                    height: '6px',
                    width: '6px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.highlight,
                  }}
                ></div>
              </RowFixed>
              <Box>{`1 ${poolData.token0.symbol} = ${Number(price0).toLocaleString(undefined, {
                minimumSignificantDigits: 1,
              })} ${poolData.token1.symbol}`}</Box>
              <Box>{`1 ${poolData.token1.symbol} = ${Number(price1).toLocaleString(undefined, {
                minimumSignificantDigits: 1,
              })} ${poolData.token0.symbol}`}</Box>
            </AutoColumn>
          </Wrapper>
        </foreignObject>
      </g>
    )
  }
  return null
}