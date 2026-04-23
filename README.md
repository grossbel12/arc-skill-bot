# Arc Telegram Bot

Telegram bot for Arc Testnet wallets, USDC transfers, transaction history, and Circle contract template deployments.

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
- `/deploy` — deploy ERC-20, ERC-721, ERC-1155, or Airdrop template
- `/status <tx_id>` — check deployment status
- `/help` — show command list

## Notes

- Uses one app-level Circle WalletSet, persisted in `users.db`.
- Creates SCA wallets on `ARC-TESTNET` for Gas Station sponsorship.
- Never commit `.env` or `users.db`.
