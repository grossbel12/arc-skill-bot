# Pamyatka dlya polzovatelya

## Check whether the bot is running

```bash
pm2 status
pm2 logs arcbot
```

## Restart the bot

```bash
pm2 restart arcbot
```

## Stop the bot

```bash
pm2 stop arcbot
```

## Start the bot again

```bash
cd /opt/arc-skill-bot
pm2 start dist/bot.js --name arcbot
pm2 save
```

## Update the code from GitHub

```bash
cd /opt/arc-skill-bot
git pull
npm install
npm run build
pm2 restart arcbot
```

## Restart after changing `.env`

```bash
cd /opt/arc-skill-bot
pm2 restart arcbot
```

## Project path

```bash
/opt/arc-skill-bot
```

## `.env` path

```bash
/opt/arc-skill-bot/.env
```

## View `.env`

```bash
cat /opt/arc-skill-bot/.env
```

## Edit `.env`

```bash
nano /opt/arc-skill-bot/.env
```

## If the bot crashes

```bash
pm2 logs arcbot --lines 100
```

## If the bot does not start after VPS reboot

```bash
pm2 resurrect
pm2 status
```

## Check in Telegram

```text
/start
/wallet
/balance
/deploy
```

## Nanopayment model

Every contract deployment costs `0.001 USDC`.

Flow:

```text
/deploy
choose contract type
bot charges 0.001 USDC
bot starts deployment after payment succeeds
/status <tx_id>
```

## Important

- Do not delete `.env`
- Do not commit `.env`
- After code changes use:

```bash
git pull
npm install
npm run build
pm2 restart arcbot
```
