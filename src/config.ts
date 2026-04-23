export const ARC = {
  blockchain: 'ARC-TESTNET',
  chainId: 5042002,
  rpcUrl: 'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app',
  faucetUrl: 'https://faucet.circle.com',
  usdcAddress: '0x3600000000000000000000000000000000000000',
  usdcDecimals: 6,
} as const

export const CONTRACT_TEMPLATES = {
  erc20: 'a1b74add-23e0-4712-88d1-6b3009e85a86',
  erc721: '76b83278-50e2-4006-8b63-5b1a2a814533',
  erc1155: 'aea21da6-0aa2-4971-9a1a-5098842b1248',
  airdrop: '13e322f2-18dc-4f57-8eed-4bddfc50f85e',
} as const
