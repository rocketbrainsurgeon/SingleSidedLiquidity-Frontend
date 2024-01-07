import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useIsMounted } from "../hooks/useIsMounted"
import { useCallback } from "react"
import { Box, Button } from "./primitives"

export const Connect = () => {
  const isMounted = useIsMounted()
  const { address: account } = useAccount()
  const { disconnect } = useDisconnect()
  const { connectAsync, connectors } = useConnect()

  const handleConnect = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async () => {
      await connectAsync({ connector: connectors[0] })
    },
    [connectAsync, connectors]
  )

  if (!isMounted) return null

  return (
    <Box width="100%">
      {account ? (
        <Button onClick={() => disconnect()}>${account}</Button>
      ) : (
        <Button
          onClick={() => {
            handleConnect()
          }}
        >
          Connect
        </Button>
      )}
    </Box>
  )
}
