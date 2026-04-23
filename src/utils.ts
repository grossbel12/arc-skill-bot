import { ARC } from './config.js'

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

export function isValidAddress(value: string) {
  return ADDRESS_RE.test(value)
}

export function parsePositiveAmount(value: string): string | undefined {
  if (!/^\d+(\.\d+)?$/.test(value)) return undefined
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return undefined
  const [, fraction = ''] = value.split('.')
  if (fraction.length > ARC.usdcDecimals) return undefined
  return value
}

export function getTelegramId(ctx: { from?: { id: number } }) {
  return ctx.from?.id
}

export function formatUsdc(value: string | number) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })
}

export function toNumber(value: unknown): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}
