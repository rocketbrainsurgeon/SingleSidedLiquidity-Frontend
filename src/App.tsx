import useWagmi from "./hooks/useWagmi"
import { Global, ThemeProvider, css } from "@emotion/react"
import styled from "@emotion/styled"
import { WagmiConfig } from "wagmi"
import theme from "./theme"
import { Box, T } from "./components/primitives"
import Page from "./page"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`

const resetStyles = css`
  /* Reset some default styles on HTML elements */
  html,
  body,
  div,
  span,
  applet,
  object,
  iframe,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  blockquote,
  pre,
  a,
  abbr,
  acronym,
  address,
  big,
  cite,
  code,
  del,
  dfn,
  em,
  img,
  ins,
  input,
  kbd,
  q,
  s,
  samp,
  select,
  small,
  strike,
  strong,
  sub,
  sup,
  tt,
  var,
  b,
  u,
  i,
  center,
  dl,
  dt,
  dd,
  ol,
  ul,
  li,
  fieldset,
  form,
  label,
  legend,
  table,
  caption,
  tbody,
  tfoot,
  thead,
  tr,
  th,
  td {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    box-sizing: border-box;
  }

  body {
    line-height: 1;
    font-family: "Inter", sans-serif;
    font-size: 16px;
    background-color: ${theme.colors.background};
    color: white;
  }
`

function App() {
  const config = useWagmi()

  return (
    <WagmiConfig config={config}>
      <ThemeProvider theme={theme}>
        <Global styles={resetStyles} />
        <Wrapper>
          <Box marginTop="1rem" width="100%" textAlign="center">
            <T fontSize="4rem" fontWeight="bold">
              SINGLE SIDED LIQUIDITY
            </T>
          </Box>
          <Page />
        </Wrapper>
      </ThemeProvider>
    </WagmiConfig>
  )
}

export default App
