import { randomUUID } from 'node:crypto'
import { ARC, CONTRACT_TEMPLATES } from '../config.js'
import { contractClient } from './client.js'

export type DeployType = 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'Airdrop'

function alphanumericName(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '')
  return cleaned || `Contract${Date.now()}`
}

async function deployTemplate(
  templateId: string,
  walletId: string,
  name: string,
  templateParameters: Record<string, unknown>,
) {
  return contractClient().deployContractTemplate({
    id: templateId,
    blockchain: ARC.blockchain,
    name: alphanumericName(name),
    walletId,
    templateParameters,
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
    idempotencyKey: randomUUID(),
  } as never)
}

export async function deployERC20(
  walletId: string,
  walletAddress: string,
  name: string,
  symbol: string,
) {
  return deployTemplate(CONTRACT_TEMPLATES.erc20, walletId, `${name}Contract`, {
    name,
    symbol,
    defaultAdmin: walletAddress,
    primarySaleRecipient: walletAddress,
  })
}

export async function deployERC721(
  walletId: string,
  walletAddress: string,
  name: string,
  symbol: string,
) {
  return deployTemplate(CONTRACT_TEMPLATES.erc721, walletId, `${name}NFTContract`, {
    name,
    symbol,
    defaultAdmin: walletAddress,
    primarySaleRecipient: walletAddress,
    royaltyRecipient: walletAddress,
    royaltyPercent: 0.01,
  })
}

export async function deployERC1155(
  walletId: string,
  walletAddress: string,
  name: string,
  symbol: string,
) {
  return deployTemplate(CONTRACT_TEMPLATES.erc1155, walletId, `${name}MultiContract`, {
    name,
    symbol,
    defaultAdmin: walletAddress,
    primarySaleRecipient: walletAddress,
    royaltyRecipient: walletAddress,
    royaltyPercent: 0.01,
  })
}

export async function deployAirdrop(walletId: string, walletAddress: string) {
  return deployTemplate(CONTRACT_TEMPLATES.airdrop, walletId, `AirdropContract${Date.now()}`, {
    defaultAdmin: walletAddress,
  })
}

export async function getContractStatus(txId: string) {
  const response = await contractClient().getContract({ id: txId } as never)
  return response.data?.contract
}
