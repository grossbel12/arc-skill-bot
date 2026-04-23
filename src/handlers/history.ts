import type { Telegraf } from 'telegraf'
import { getTransactions } from '../circle/wallets.js'
import { getUser } from '../db.js'
import { addressLink, divider, genericError, noWalletMessage, shortAddress } from '../messages.js'
import { getTelegramId } from '../utils.js'

type CircleTransaction = {
  id?: string
  state?: string
  transactionType?: string
  amounts?: string[]
  tokenId?: string
  destinationAddress?: string
  createDate?: string
  updateDate?: string
}

function formatTransaction(tx: CircleTransaction, index: number) {
  const amount = tx.amounts?.[0]
  const destination = tx.destinationAddress ? shortAddress(tx.destinationAddress) : 'unknown'
  const state = tx.state ?? 'UNKNOWN'
  const kind = tx.transactionType ?? 'Transaction'
  const amountText = amount ? `${amount} USDC` : 'USDC'
  return `${index + 1}. ${kind} ${amountText} → ${destination} (${state})`
}

export function registerHistoryHandler(bot: Telegraf) {
  bot.command('history', async (ctx) => {
    const telegramId = getTelegramId(ctx)
    if (!telegramId) return

    const user = getUser(telegramId)
    if (!user) {
      await ctx.reply(noWalletMessage())
      return
    }

    try {
      const transactions = (await getTransactions(user.wallet_id)) as CircleTransaction[]
      const lines =
        transactions.length > 0
          ? transactions.map(formatTransaction).join('\n')
          : 'No transactions yet.'

      await ctx.reply(
        `📋 Recent Transactions:\n\n${lines}\n\n🔎 Full history: ${addressLink(user.wallet_address)}${divider}▶️ What's next?\n\n📤 Send USDC → /send 0xAddress amount\n🚀 Deploy a contract → /deploy`,
      )
    } catch (error) {
      console.error('history failed', error)
      await ctx.reply(genericError())
    }
  })
}
