export const ChainId = {
  POLYGON_MAINNET: 137,
  BASE_TESTNET: 84532,
};

export const supportedChains = [
  ChainId.POLYGON_MAINNET,
  ChainId.BASE_TESTNET,
];

export const getRPCProvider = (chainId: number): string => {
  switch (chainId) {
    case ChainId.POLYGON_MAINNET:
      return "https://polygon-mainnet.infura.io";
    case ChainId.BASE_TESTNET:
      return "https://sepolia.base.org";
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export const getExplorer = (chainId: number): string => {
  switch (chainId) {
    case ChainId.POLYGON_MAINNET:
      return "https://polygonscan.com";
    case ChainId.BASE_TESTNET:
      return "https://sepolia-explorer.base.org";
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};
