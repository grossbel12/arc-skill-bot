import { randomUUID } from 'node:crypto'
import { ARC, NANOPAYMENTS } from '../config.js'
import { getAppState, setAppState } from '../db.js'
import { walletClient } from './client.js'

const WALLET_SET_KEY = 'wallet_set_id'
const FEE_COLLECTOR_WALLET_ID_KEY = 'fee_collector_wallet_id'
const FEE_COLLECTOR_WALLET_ADDRESS_KEY = 'fee_collector_wallet_address'

type CircleTokenBalance = {
  token?: { symbol?: string; tokenAddress?: string }
  amount?: string
}

type CircleTransactionResponse = {
  transaction?: { id?: string; txHash?: string; transactionHash?: string }
  id?: string
  txHash?: string
  transactionHash?: string
}

export async function getOrCreateWalletSetId() {
  const existing = getAppState(WALLET_SET_KEY)
  if (existing) return existing

  const response = await walletClient().createWalletSet({
    name: `ArcBot-${Date.now()}`,
    idempotencyKey: randomUUID(),
  } as never)
  const walletSetId = response.data?.walletSet?.id
  if (!walletSetId) throw new Error('Circle did not return a wallet set id')

  setAppState(WALLET_SET_KEY, walletSetId)
  return walletSetId
}

export async function createUserWallet() {
  const walletSetId = await getOrCreateWalletSetId()
  const response = await walletClient().createWallets({
    walletSetId,
    blockchains: [ARC.blockchain],
    count: 1,
    accountType: 'SCA',
    idempotencyKey: randomUUID(),
  } as never)

  const wallet = response.data?.wallets?.[0]
  if (!wallet?.id || !wallet?.address) throw new Error('Circle did not return a wallet')
  return { walletId: wallet.id, walletAddress: wallet.address }
}

export async function getOrCreateFeeCollectorWallet() {
  const existingWalletId = getAppState(FEE_COLLECTOR_WALLET_ID_KEY)
  const existingWalletAddress = getAppState(FEE_COLLECTOR_WALLET_ADDRESS_KEY)
  if (existingWalletId && existingWalletAddress) {
    return { walletId: existingWalletId, walletAddress: existingWalletAddress }
  }

  const wallet = await createUserWallet()
  setAppState(FEE_COLLECTOR_WALLET_ID_KEY, wallet.walletId)
  setAppState(FEE_COLLECTOR_WALLET_ADDRESS_KEY, wallet.walletAddress)
  return wallet
}

export async function getTokenBalances(walletId: string) {
  const response = await walletClient().getWalletTokenBalance({ id: walletId } as never)
  return (response.data?.tokenBalances ?? []) as CircleTokenBalance[]
}

export async function getUsdcBalance(walletId: string) {
  const balances = await getTokenBalances(walletId)
  return (
    balances.find((balance) => {
      const symbol = balance.token?.symbol?.toUpperCase()
      const address = balance.token?.tokenAddress?.toLowerCase()
      return symbol === 'USDC' || address === ARC.usdcAddress.toLowerCase()
    })?.amount ?? '0'
  )
}

export async function sendUsdc(walletId: string, toAddress: string, amount: string) {
  const response = await walletClient().createTransaction({
    walletId,
    blockchain: ARC.blockchain,
    destinationAddress: toAddress,
    amounts: [amount],
    tokenAddress: ARC.usdcAddress,
    fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
    idempotencyKey: randomUUID(),
  } as never)
  return response.data
}

export function getTransactionIdentifier(data: unknown) {
  const response = data as CircleTransactionResponse | undefined
  return (
    response?.transaction?.txHash ??
    response?.transaction?.transactionHash ??
    response?.transaction?.id ??
    response?.txHash ??
    response?.transactionHash ??
    response?.id ??
    'pending'
  )
}

export async function collectDeployFee(walletId: string) {
  const collector = await getOrCreateFeeCollectorWallet()
  const response = await sendUsdc(walletId, collector.walletAddress, NANOPAYMENTS.deployFeeUsdc)
  return {
    collectorAddress: collector.walletAddress,
    transactionId: getTransactionIdentifier(response),
  }
}

export async function getTransactions(walletId: string) {
  const response = await walletClient().listTransactions({ walletIds: [walletId] } as never)
  return response.data?.transactions?.slice(0, 5) ?? []
}

export async function getTransaction(txId: string) {
  const response = await walletClient().getTransaction({ id: txId } as never)
  return response.data?.transaction
}
