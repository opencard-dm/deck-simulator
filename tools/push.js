import { spawn, execSync } from 'child_process'

import 'dotenv/config'
if (!process.env.VERSION) {
  throw new Error('process.env.VERSION is required')
}

const version = process.env.VERSION
const repository = 'asia-northeast1-docker.pkg.dev/duel-masters-407617/tcg-simulator'

// gcloud artifacts repositories list --location=asia-northeast1

execSync(`docker tag tcg-simulator/app:${version} ${repository}/app:${version}`)

spawn('docker', [
  'push',
  `${repository}/app:${version}`,
]).stdout.on('data', (chunk) => {
  process.stdout.write(chunk) // without new line
}).on('close', () => {
  console.log('docker push finished')
  process.stdout.write(
    execSync(`docker rmi ${repository}/app:${version}`)
  )
})
