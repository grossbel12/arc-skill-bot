import type { Telegraf } from 'telegraf'
import { ARC } from '../config.js'
import { createUserWallet } from '../circle/wallets.js'
import { getUser, saveUser } from '../db.js'
import { addressLink, divider, genericError } from '../messages.js'
import { getTelegramId } from '../utils.js'

export function registerWalletHandler(bot: Telegraf) {
  bot.command('wallet', async (ctx) => {
    const telegramId = getTelegramId(ctx)
    if (!telegramId) return

    const existing = getUser(telegramId)
    if (existing) {
      await ctx.reply(
        `🔑 Your wallet:\n\n📬 Address: ${existing.wallet_address}\n🌐 Network: Arc Testnet\n🔎 ${addressLink(existing.wallet_address)}`,
      )
      return
    }

    try {
      const wallet = await createUserWallet()
      saveUser(telegramId, wallet.walletId, wallet.walletAddress)

      await ctx.reply(
        `✅ Wallet created!\n\n📬 Address: ${wallet.walletAddress}\n🌐 Network: Arc Testnet${divider}▶️ Step 2 — Fund your wallet with test USDC:\n\n1. Open 👉 ${ARC.faucetUrl}\n2. Select network: Arc Testnet\n3. Paste your address: ${wallet.walletAddress}\n4. Click "Send"\n\nYou'll receive free test USDC!\n\nAfter that, type /balance to confirm they arrived.`,
      )
    } catch (error) {
      console.error('wallet:create failed', error)
      await ctx.reply(genericError())
    }
  })
}
