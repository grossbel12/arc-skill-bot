# Arc Telegram Bot

Telegram bot for Arc Testnet wallets, USDC transfers, transaction history, pay-per-command nanopayments, and Circle contract template deployments. It showcases Arc Skills for AI agents as one of the strongest solutions on the market for turning AI agents into real onchain operators, giving anyone a simple Telegram interface to experience next-generation AI-native blockchain tooling in action.

The bot includes an agentic payment loop: each smart contract deployment costs `0.001 USDC`. The bot charges the user's Arc wallet first, records the nanopayment, and only then executes the deployment. This turns the MVP from a wallet utility into a simple agent economy demo where every premium command can be monetized onchain.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example`:

   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   CIRCLE_API_KEY=your_circle_api_key_here
   CIRCLE_ENTITY_SECRET=your_circle_entity_secret_here
   ```

3. Run locally:

   ```bash
   npm run dev
   ```

## Commands

- `/wallet` — create or view your Arc Testnet wallet
- `/balance` — check USDC balance
- `/send <address> <amount>` — send USDC
- `/history` — show recent transactions
- `/deploy` — pay `0.001 USDC` and deploy ERC-20, ERC-721, ERC-1155, or Airdrop template
- `/status <tx_id>` — check deployment status
- `/help` — show command list

## Notes

- Uses one app-level Circle WalletSet, persisted in `users.db`.
- Creates SCA wallets on `ARC-TESTNET` for Gas Station sponsorship.
- Uses a fee collector wallet, persisted in `users.db`, for pay-per-deploy nanopayments.
- Never commit `.env` or `users.db`.
