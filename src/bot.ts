import * as dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { registerBalanceHandler } from './handlers/balance.js'
import { registerDeployHandler } from './handlers/deploy.js'
import { registerHistoryHandler } from './handlers/history.js'
import { registerSendHandler } from './handlers/send.js'
import { registerStartHandlers } from './handlers/start.js'
import { registerWalletHandler } from './handlers/wallet.js'

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
  throw new Error('Missing required environment variable: TELEGRAM_BOT_TOKEN')
}

const bot = new Telegraf(token)

registerStartHandlers(bot)
registerWalletHandler(bot)
registerBalanceHandler(bot)
registerSendHandler(bot)
registerHistoryHandler(bot)
registerDeployHandler(bot)

bot.catch((error) => {
  console.error('bot error', error)
})

await bot.launch()
console.log('Arc Bot started!')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
