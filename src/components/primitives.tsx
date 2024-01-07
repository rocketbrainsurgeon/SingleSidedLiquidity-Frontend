import styled from "@emotion/styled"

export interface BoxProps {
  display?: string
  width?: string
  maxWidth?: string
  height?: string
  margin?: string
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
  padding?: string
  paddingTop?: string
  paddingBottom?: string
  paddingLeft?: string
  paddingRight?: string
  border?: string
  borderRadius?: string
  textAlign?: "left" | "center" | "right"
}

export interface FlexProps extends BoxProps {
  flex?: string
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse"
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly"
  alignItems?: "stretch" | "flex-start" | "center" | "flex-end" | "baseline"
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
}

export interface TextProps {
  fontSize?: string
  fontWeight?: "normal" | "bold" | "bolder" | "lighter"
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
  textDecoration?: "none" | "underline" | "overline" | "line-through"
  textAlign?: "left" | "center" | "right"
  color?: string
}

export interface ButtonProps extends BoxProps {
  highlight?: boolean
}

export const Box = styled.div<BoxProps>`
  display: ${(props) => props.display};
  width: ${(props) => props.width};
  max-width: ${(props) => props.maxWidth};
  height: ${(props) => props.height};
  margin: ${(props) => props.margin};
  padding: ${(props) => props.padding};
  border: ${(props) => props.border};
  border-radius: ${(props) => props.borderRadius};
  text-align: ${(props) => props.textAlign};
  margin-top: ${(props) => props.marginTop};
  margin-bottom: ${(props) => props.marginBottom};
  margin-left: ${(props) => props.marginLeft};
  margin-right: ${(props) => props.marginRight};
  padding-top: ${(props) => props.paddingTop};
  padding-bottom: ${(props) => props.paddingBottom};
  padding-left: ${(props) => props.paddingLeft};
  padding-right: ${(props) => props.paddingRight};
`

export const Flex = styled(Box)<FlexProps>`
  display: flex;
  flex: ${(props) => props.flex || "0 1 auto"};
  flex-direction: ${(props) => props.flexDirection || "row"};
  justify-content: ${(props) => props.justifyContent || "flex-start"};
  align-items: ${(props) => props.alignItems || "stretch"};
  flex-wrap: ${(props) => props.flexWrap || "nowrap"};
`

export const T = styled.span<TextProps>`
  font-size: ${(props) => props.fontSize || "16px"};
  font-weight: ${(props) => props.fontWeight || "normal"};
  text-transform: ${(props) => props.textTransform || "none"};
  text-decoration: ${(props) => props.textDecoration || "none"};
  text-align: ${(props) => props.textAlign || "left"};
  color: ${(props) => props.color || "white"};
`

export const Input = styled.input<BoxProps>`
  border: none;
  border-radius: 0.5rem;
  padding: 10px 15px;

  :selected {
    outline: none;
  }

  :focus {
    outline: none;
  }
`

export const Button = styled.button<ButtonProps>`
  border: none;
  border-radius: 0.5rem;
  padding: 10px 15px;
  width: 100%;

  :hover {
    cursor: pointer;
    opacity: 0.8;
  }

  ${(props) =>
    props.highlight &&
    `
    background-color: ${props.theme.colors.highlight};
  `}

  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Select = styled.select<BoxProps>`
  border: none;
  border-radius: 0.5rem;
  padding: 10px 15px;

  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
`

export const StyledLink = styled.a`
  color: white;
  text-decoration: underline;
  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
`
