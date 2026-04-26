import type { Context, Telegraf } from 'telegraf'
import { Markup } from 'telegraf'
import {
  DeployType,
  deployAirdrop,
  deployERC1155,
  deployERC20,
  deployERC721,
} from '../circle/contracts.js'
import { collectDeployFee, getTransaction, getUsdcBalance } from '../circle/wallets.js'
import { NANOPAYMENTS } from '../config.js'
import { getDeployment, getLatestDeploymentForUser, getUser, saveDeployment, savePayment } from '../db.js'
import { addressLink, divider, genericError, noWalletMessage } from '../messages.js'
import { formatUsdc, getTelegramId, toNumber } from '../utils.js'

type DeploySession = {
  type: Exclude<DeployType, 'Airdrop'>
}

type DeployResponse = {
  data?: {
    contractIds?: string[]
    transactionId?: string
    id?: string
  }
  contract?: { id?: string }
  contractIds?: string[]
  id?: string
  transactionId?: string
}

type ContractStatus = {
  id?: string
  contractAddress?: string
  address?: string
  status?: string
  state?: string
  txHash?: string
}

const sessions = new Map<number, DeploySession>()

function deployKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🪙 ERC-20 Token', 'deploy:erc20')],
    [Markup.button.callback('🖼 ERC-721 NFT', 'deploy:erc721')],
    [Markup.button.callback('📦 ERC-1155 Multi-Token', 'deploy:erc1155')],
    [Markup.button.callback('🎁 Airdrop Contract', 'deploy:airdrop')],
  ])
}

function getDeployId(response: unknown) {
  const data = response as DeployResponse | undefined
  return (
    data?.data?.transactionId ??
    data?.transactionId ??
    data?.data?.id ??
    data?.id ??
    data?.contract?.id ??
    'pending'
  )
}

function getContractId(response: unknown) {
  const data = response as DeployResponse | undefined
  return data?.data?.contractIds?.[0] ?? data?.contractIds?.[0] ?? data?.contract?.id
}

function circleErrorMessage(error: unknown) {
  const response = error as {
    response?: {
      data?: {
        message?: string
        errors?: Array<{ message?: string; location?: string; field?: string }>
      }
    }
  }
  const data = response.response?.data
  const detail = data?.errors
    ?.map((item) => item.message ?? item.field ?? item.location)
    .filter(Boolean)
    .join('; ')
  return detail ? `${data?.message ?? 'Circle API error'}: ${detail}` : data?.message
}

async function ensureUser(ctx: Context) {
  const telegramId = getTelegramId(ctx)
  if (!telegramId) return undefined

  const user = getUser(telegramId)
  if (!user) {
    await ctx.reply(noWalletMessage())
    return undefined
  }

  return { telegramId, user }
}

async function startDeployment(
  ctx: Context,
  type: DeployType,
  walletId: string,
  deploy: () => Promise<unknown>,
  name?: string,
  symbol?: string,
) {
  try {
    const telegramId = getTelegramId(ctx)
    if (!telegramId) return

    const balance = await getUsdcBalance(walletId)
    if (toNumber(balance) < toNumber(NANOPAYMENTS.deployFeeUsdc)) {
      await ctx.reply(
        `❌ Not enough USDC for this paid agent action.\n\nRequired fee: ${NANOPAYMENTS.deployFeeLabel}\nYour balance: ${formatUsdc(balance)} USDC\n\nFund your wallet with test USDC first, then try /deploy again.`,
      )
      return
    }

    await ctx.reply(
      `💳 Agentic payment required\n\nAction: Deploy ${type} contract\nPrice: ${NANOPAYMENTS.deployFeeLabel}\n\nCharging your Arc wallet now. Deployment starts after payment succeeds.`,
    )

    const payment = await collectDeployFee(walletId)
    savePayment(payment.transactionId, telegramId, walletId, NANOPAYMENTS.deployFeeUsdc, `deploy:${type}`)
    await ctx.reply(
      `✅ Nanopayment accepted\n\nPaid: ${NANOPAYMENTS.deployFeeLabel}\nPayment TX: ${payment.transactionId}\n\nStarting contract deployment now...`,
    )

    const response = await deploy()
    const txId = getDeployId(response)
    const contractId = getContractId(response)
    if (telegramId && txId !== 'pending') saveDeployment(txId, telegramId, type)

    const details =
      type === 'Airdrop'
        ? `Type: ${type}`
        : `Type: ${type}\nName: ${name}\nSymbol: ${symbol}`

    await ctx.reply(
      `🚀 Deployment started!\n\n${details}\n\n⏳ Status: PENDING\nTransaction ID: ${txId}${contractId ? `\nContract ID: ${contractId}` : ''}\n\nCheck status in ~30 seconds.\nCopy and send this exact command:\n/status ${txId}`,
    )
  } catch (error) {
    const message = circleErrorMessage(error)
    console.error('deploy failed', message ?? error)
    await ctx.reply(message ? `❌ ${message}` : genericError())
  }
}

export function registerDeployHandler(bot: Telegraf) {
  bot.command('deploy', async (ctx) => {
    const ready = await ensureUser(ctx)
    if (!ready) return

    await ctx.reply('🚀 Choose contract type to deploy:', deployKeyboard())
  })

  bot.action(/^deploy:(erc20|erc721|erc1155|airdrop)$/, async (ctx) => {
    await ctx.answerCbQuery()
    const ready = await ensureUser(ctx)
    if (!ready) return

    const selection = ctx.match[1]
    if (selection === 'airdrop') {
      await startDeployment(ctx, 'Airdrop', ready.user.wallet_id, () =>
        deployAirdrop(ready.user.wallet_id, ready.user.wallet_address),
      )
      return
    }

    const type =
      selection === 'erc20' ? 'ERC-20' : selection === 'erc721' ? 'ERC-721' : 'ERC-1155'
    sessions.set(ready.telegramId, { type })
    await ctx.reply('Enter token name and symbol separated by space.\nExample: MyToken MTK')
  })

  bot.command('status', async (ctx) => {
    const telegramId = getTelegramId(ctx)
    if (!telegramId) return

    const [, txId] = ctx.message.text.trim().split(/\s+/)
    if (!txId) {
      const latest = getLatestDeploymentForUser(telegramId)
      await ctx.reply(
        latest
          ? `❌ Missing transaction ID.\nCopy and send this exact command:\n/status ${latest.tx_id}`
          : '❌ Missing transaction ID.\nExample: /status abc-123',
      )
      return
    }

    const deployment = getDeployment(txId)
    if (deployment && deployment.telegram_id !== telegramId) {
      await ctx.reply('❌ Deployment not found for your Telegram account.')
      return
    }

    try {
      const status = (await getTransaction(txId)) as ContractStatus | undefined
      const address = status?.contractAddress ?? status?.address
      const state = status?.status ?? status?.state ?? 'PENDING'

      if (address) {
        await ctx.reply(
          `✅ Contract deployed!\n\nContract address: ${address}\n🔎 ${addressLink(address)}${divider}▶️ What's next?\n\n🚀 Deploy another → /deploy\n💰 Check balance → /balance`,
        )
        return
      }

      await ctx.reply(`⏳ Still deploying...\n\nStatus: ${state}\nCheck again in 15 seconds: /status ${txId}`)
    } catch (error) {
      console.error('status failed', error)
      await ctx.reply(genericError())
    }
  })

  bot.on('text', async (ctx, next) => {
    const telegramId = getTelegramId(ctx)
    if (!telegramId) return next()

    const session = sessions.get(telegramId)
    if (!session) return next()

    const user = getUser(telegramId)
    if (!user) {
      sessions.delete(telegramId)
      await ctx.reply(noWalletMessage())
      return
    }

    const [name, symbol] = ctx.message.text.trim().split(/\s+/)
    if (!name || !symbol) {
      await ctx.reply('❌ Please enter token name and symbol separated by space.\nExample: MyToken MTK')
      return
    }

    sessions.delete(telegramId)
    if (session.type === 'ERC-20') {
      await startDeployment(ctx, session.type, user.wallet_id, () =>
        deployERC20(user.wallet_id, user.wallet_address, name, symbol),
      name, symbol)
    } else if (session.type === 'ERC-721') {
      await startDeployment(ctx, session.type, user.wallet_id, () =>
        deployERC721(user.wallet_id, user.wallet_address, name, symbol),
      name, symbol)
    } else {
      await startDeployment(ctx, session.type, user.wallet_id, () =>
        deployERC1155(user.wallet_id, user.wallet_address, name, symbol),
      name, symbol)
    }
  })
}
