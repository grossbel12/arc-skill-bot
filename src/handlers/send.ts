import type { Telegraf } from 'telegraf'
import { ARC } from '../config.js'
import { getTransactionIdentifier, getUsdcBalance, sendUsdc } from '../circle/wallets.js'
import { getUser } from '../db.js'
import { divider, genericError, noWalletMessage, txLink } from '../messages.js'
import { formatUsdc, getTelegramId, isValidAddress, parsePositiveAmount, toNumber } from '../utils.js'

export function registerSendHandler(bot: Telegraf) {
  bot.command('send', async (ctx) => {
    const telegramId = getTelegramId(ctx)
    if (!telegramId) return

    const user = getUser(telegramId)
    if (!user) {
      await ctx.reply(noWalletMessage())
      return
    }

    const [, toAddress, rawAmount] = ctx.message.text.trim().split(/\s+/)
    const amount = rawAmount ? parsePositiveAmount(rawAmount) : undefined

    if (!toAddress || !isValidAddress(toAddress)) {
      await ctx.reply('❌ Invalid address format.\nExample: /send 0x1234...abcd 5')
      return
    }

    if (!amount) {
      await ctx.reply('❌ Invalid amount.\nExample: /send 0x1234...abcd 5')
      return
    }

    try {
      const balance = await getUsdcBalance(user.wallet_id)
      if (toNumber(balance) < toNumber(amount)) {
        await ctx.reply(
          `❌ Insufficient balance.\nYour balance: ${formatUsdc(balance)} USDC\nRequested: ${formatUsdc(amount)} USDC\n\nGet more test USDC: ${ARC.faucetUrl}`,
        )
        return
      }

      await ctx.reply(`📤 Sending ${formatUsdc(amount)} USDC to ${toAddress}...`)
      const response = await sendUsdc(user.wallet_id, toAddress, amount)
      const tx = getTransactionIdentifier(response)
      const link = tx.startsWith('0x') ? `\n🔎 ${txLink(tx)}` : ''

      await ctx.reply(
        `⏳ Transaction submitted!\nTX: ${tx}${link}${divider}▶️ What's next?\n\n📋 Check history → /history\n🚀 Deploy a contract → /deploy`,
      )
    } catch (error) {
      console.error('send failed', error)
      await ctx.reply(genericError())
    }
  })
}
