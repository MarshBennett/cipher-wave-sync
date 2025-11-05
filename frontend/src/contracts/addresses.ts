// Contract addresses for different networks
// Update these after deploying contracts

export const CONTRACT_ADDRESSES: Record<number, string> = {
  31337: '', // localhost - update after deployment
  11155111: '', // sepolia - update after deployment
};

export const getContractAddress = (chainId: number | undefined): string | undefined => {
  if (!chainId) return undefined;
  return CONTRACT_ADDRESSES[chainId];
};
