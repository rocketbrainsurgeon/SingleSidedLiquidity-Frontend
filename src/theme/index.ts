import '@emotion/react'

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      chartBackground: string
      background: string
      highlight: string
      chartRange: string
      chartUnusedLiquidity: string
    }
  }
}

const theme = {
  colors: {
    chartBackground: "#E5DCC5",
    background: "#2D2D2A",
    highlight: "#4C4C47",
    chartRange: "#848FA5",
    chartUnusedLiquidity: "#C14953",
  },
}

export default theme
