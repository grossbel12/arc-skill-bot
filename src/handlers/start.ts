import type { Telegraf } from 'telegraf'
import { ARC, NANOPAYMENTS } from '../config.js'
import { divider } from '../messages.js'

export function registerStartHandlers(bot: Telegraf) {
  bot.start((ctx) =>
    ctx.reply(
      `👋 Welcome to Arc Bot!\n\nI help you work with Arc Testnet — Circle's blockchain where USDC is the native token.\n\nWhat I can do:\n🔑 Create a wallet on Arc Testnet\n💰 Check your USDC balance\n📤 Send USDC to any address\n💳 Pay per agent action with USDC nanopayments\n🚀 Deploy smart contracts\n📋 View transaction history${divider}▶️ Agentic payment loop:\n\nEach contract deployment costs ${NANOPAYMENTS.deployFeeLabel}. The bot charges your Arc wallet first, records the payment, and only then executes the deployment. This shows how AI agents can monetize real onchain actions command by command.${divider}▶️ What you can do next:\n\n1. Create your wallet with /wallet\n2. Fund it with test USDC from ${ARC.faucetUrl}\n3. Check your funds with /balance\n4. Send USDC with /send <address> <amount>\n5. View your history with /history\n6. Deploy paid contracts with /deploy\n7. Check deployment progress with /status <tx_id>${divider}🤖 Available commands:\n\n/start — show welcome message\n/wallet — create or view your wallet\n/balance — check USDC balance\n/send <address> <amount> — send USDC\n/history — show recent transactions\n/deploy — pay ${NANOPAYMENTS.deployFeeLabel} and deploy ERC-20, ERC-721, ERC-1155, or Airdrop\n/status <tx_id> — check deployment status\n/help — show command list`,
    ),
  )

  bot.help((ctx) =>
    ctx.reply(
      `🤖 Arc Bot Commands:\n\n/wallet — create or view your wallet\n/balance — check USDC balance\n/send <address> <amount> — send USDC\n/history — last 5 transactions\n/deploy — pay ${NANOPAYMENTS.deployFeeLabel} and deploy a smart contract\n/status <tx_id> — check deployment status\n/help — show this message${divider}💳 Agentic payment model:\nEvery deployment is a paid command. The bot charges ${NANOPAYMENTS.deployFeeLabel} from your Arc wallet before execution.${divider}🌐 Arc Testnet Explorer: ${ARC.explorerUrl}\n💧 Get test USDC: ${ARC.faucetUrl}`,
    ),
  )
}
