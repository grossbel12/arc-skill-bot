import type { Telegraf } from 'telegraf'
import { ARC } from '../config.js'
import { divider } from '../messages.js'

export function registerStartHandlers(bot: Telegraf) {
  bot.start((ctx) =>
    ctx.reply(
      `👋 Welcome to Arc Bot!\n\nI help you work with Arc Testnet — Circle's blockchain where USDC is the native token.\n\nWhat I can do:\n🔑 Create a wallet on Arc Testnet\n💰 Check your USDC balance\n📤 Send USDC to any address\n🚀 Deploy smart contracts\n📋 View transaction history${divider}▶️ What you can do next:\n\n1. Create your wallet with /wallet\n2. Fund it with test USDC from ${ARC.faucetUrl}\n3. Check your funds with /balance\n4. Send USDC with /send <address> <amount>\n5. View your history with /history\n6. Deploy contracts with /deploy\n7. Check deployment progress with /status <tx_id>${divider}🤖 Available commands:\n\n/start — show welcome message\n/wallet — create or view your wallet\n/balance — check USDC balance\n/send <address> <amount> — send USDC\n/history — show recent transactions\n/deploy — deploy ERC-20, ERC-721, ERC-1155, or Airdrop\n/status <tx_id> — check deployment status\n/help — show command list`,
    ),
  )

  bot.help((ctx) =>
    ctx.reply(
      `🤖 Arc Bot Commands:\n\n/wallet — create or view your wallet\n/balance — check USDC balance\n/send <address> <amount> — send USDC\n/history — last 5 transactions\n/deploy — deploy a smart contract\n/status <tx_id> — check deployment status\n/help — show this message${divider}🌐 Arc Testnet Explorer: ${ARC.explorerUrl}\n💧 Get test USDC: ${ARC.faucetUrl}`,
    ),
  )
}
