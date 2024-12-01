import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { baseSepolia, polygon } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

// Configure chains and providers
const { chains, publicClient } = configureChains(
  [polygon, baseSepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 137) {
          // Polygon Mainnet
          return {
            http: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
            webSocket:
              'wss://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
          };
        } else if (chain.id === 80001) {
          // Polygon Mumbai Testnet
          return {
            http: 'https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
            webSocket:
              'wss://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
          };
        } else if (chain.id === baseSepolia.id) {
          // Base Sepolia Testnet
          return {
            http: 'https://sepolia.base.org', // Replace with the actual Base Sepolia RPC URL
          };
        } else {
          throw new Error(`Unsupported chain ID: ${chain.id}`);
        }
      },
    }),
  ]
);

// Configure wallet connectors
const { connectors } = getDefaultWallets({
  appName: 'Reels-Fi',
  projectId: '87106bd465234d097b8a51ba585bf799', // Replace with your actual project ID
  chains,
});

// Create Wagmi configuration
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export { chains, wagmiConfig };
