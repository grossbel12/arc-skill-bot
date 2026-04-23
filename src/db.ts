import Database from 'better-sqlite3'

export type UserRecord = {
  telegram_id: number
  wallet_id: string
  wallet_address: string
  created_at: string
}

export type DeploymentRecord = {
  tx_id: string
  telegram_id: number
  type: string
  created_at: string
}

const db = new Database('users.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    telegram_id INTEGER PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deployments (
    tx_id TEXT PRIMARY KEY,
    telegram_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

export function getAppState(key: string): string | undefined {
  const row = db.prepare('SELECT value FROM app_state WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value
}

export function setAppState(key: string, value: string) {
  db.prepare('INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)').run(key, value)
}

export function getUser(telegramId: number): UserRecord | undefined {
  return db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId) as
    | UserRecord
    | undefined
}

export function saveUser(telegramId: number, walletId: string, walletAddress: string) {
  db.prepare(
    'INSERT OR REPLACE INTO users (telegram_id, wallet_id, wallet_address) VALUES (?, ?, ?)',
  ).run(telegramId, walletId, walletAddress)
}

export function saveDeployment(txId: string, telegramId: number, type: string) {
  db.prepare('INSERT OR REPLACE INTO deployments (tx_id, telegram_id, type) VALUES (?, ?, ?)').run(
    txId,
    telegramId,
    type,
  )
}

export function getDeployment(txId: string): DeploymentRecord | undefined {
  return db.prepare('SELECT * FROM deployments WHERE tx_id = ?').get(txId) as
    | DeploymentRecord
    | undefined
}

export function getLatestDeploymentForUser(telegramId: number): DeploymentRecord | undefined {
  return db
    .prepare('SELECT * FROM deployments WHERE telegram_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(telegramId) as DeploymentRecord | undefined
}
