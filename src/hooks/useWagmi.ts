import { configureChains, createConfig } from "wagmi"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { publicProvider } from "wagmi/providers/public"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import { polygon } from "wagmi/chains"

const useWagmi = () => {
  const { chains, publicClient } = configureChains(
    [polygon],
    [
      jsonRpcProvider({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        rpc: (chain) => ({
          http: polygon.rpcUrls.public.http[0],
        }),
      }),
      publicProvider(),
    ]
  )

  const config = createConfig({
    autoConnect: true,
    connectors: [new MetaMaskConnector({ chains })],
    publicClient,
  })

  return config
}

export default useWagmi
