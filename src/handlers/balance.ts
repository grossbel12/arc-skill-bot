import type { Telegraf } from 'telegraf'
import { ARC } from '../config.js'
import { getUsdcBalance } from '../circle/wallets.js'
import { getUser } from '../db.js'
import { addressLink, divider, genericError, noWalletMessage } from '../messages.js'
import { formatUsdc, getTelegramId, toNumber } from '../utils.js'

export function registerBalanceHandler(bot: Telegraf) {
  bot.command('balance', async (ctx) => {
    const telegramId = getTelegramId(ctx)
    if (!telegramId) return

    const user = getUser(telegramId)
    if (!user) {
      await ctx.reply(noWalletMessage())
      return
    }

    try {
      const usdc = await getUsdcBalance(user.wallet_id)
      if (toNumber(usdc) <= 0) {
        await ctx.reply(
          `💰 Balance: 0 USDC${divider}⚠️ Your wallet is empty!\n\nGet free test USDC:\n👉 ${ARC.faucetUrl}\n\nSelect Arc Testnet and paste your address: ${user.wallet_address}`,
        )
        return
      }

      await ctx.reply(
        `💰 Wallet Balance\n\n📬 Address: ${user.wallet_address}\n💵 USDC: ${formatUsdc(usdc)}\n\n🔎 ${addressLink(user.wallet_address)}${divider}▶️ What's next?\n\n📤 Send USDC → /send 0xAddress 5\n🚀 Deploy a contract → /deploy\n📋 Transaction history → /history`,
      )
    } catch (error) {
      console.error('balance failed', error)
      await ctx.reply(genericError())
    }
  })
}
