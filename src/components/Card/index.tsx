import styled from "@emotion/styled"
import { Box } from "../primitives"

const Card = styled(Box)<{
  width?: string
  padding?: string
  border?: string
  borderRadius?: string
  $minHeight?: number
}>`
  width: ${({ width }) => width ?? '100%'};
  border-radius: 16px;
  padding: 1rem;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
  min-height: ${({ $minHeight }) => `${$minHeight}px`};
`
export default Card

export const LightCard = styled(Card)`
  border: 1px solid rgb(44, 47, 54);
  background-color: rgb(44, 47, 54);
`

export const ScrollableX = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;

  ::-webkit-scrollbar {
    display: none;
  }
`