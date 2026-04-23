import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import * as dotenv from 'dotenv'
import { registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets'

dotenv.config()

const apiKey = process.env.CIRCLE_API_KEY
if (!apiKey || apiKey === 'your_circle_api_key_here') {
  throw new Error('CIRCLE_API_KEY is missing in .env')
}

const envPath = path.resolve('.env')
const outputDir = path.resolve('circle-output')
const entitySecret = crypto.randomBytes(32).toString('hex')

fs.mkdirSync(outputDir, { recursive: true })

await registerEntitySecretCiphertext({
  apiKey,
  entitySecret,
  recoveryFileDownloadPath: outputDir,
})

const env = fs.readFileSync(envPath, 'utf8')
const nextEnv = env.replace(/^CIRCLE_ENTITY_SECRET=.*$/m, `CIRCLE_ENTITY_SECRET=${entitySecret}`)
fs.writeFileSync(envPath, nextEnv, 'utf8')

console.log('Entity secret registered and saved to .env')
console.log(`Recovery file directory: ${outputDir}`)
