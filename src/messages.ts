import { ARC } from './config.js'

export const divider = '\n━━━━━━━━━━━━━━━\n'

export function addressLink(address: string) {
  return `${ARC.explorerUrl}/address/${address}`
}

export function txLink(hash: string) {
  return `${ARC.explorerUrl}/tx/${hash}`
}

export function shortAddress(address: string) {
  if (address.length <= 14) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function genericError() {
  return '❌ Something went wrong. Please try again.'
}

export function noWalletMessage() {
  return "⚠️ You don't have a wallet yet.\nType /wallet to create one first."
}
