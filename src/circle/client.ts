import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'
import { initiateSmartContractPlatformClient } from '@circle-fin/smart-contract-platform'

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function walletClient() {
  return initiateDeveloperControlledWalletsClient({
    apiKey: requireEnv('CIRCLE_API_KEY'),
    entitySecret: requireEnv('CIRCLE_ENTITY_SECRET'),
  })
}

export function contractClient() {
  return initiateSmartContractPlatformClient({
    apiKey: requireEnv('CIRCLE_API_KEY'),
    entitySecret: requireEnv('CIRCLE_ENTITY_SECRET'),
  })
}
