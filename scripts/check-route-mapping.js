#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'

function usage() {
  console.log('Usage: node check-route-mapping.js --frontend <frontend/src> --backend <backend/src/main/java>')
}

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { frontend: 'frontend/src', backend: 'backend/src/main/java' }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if ((a === '--frontend' || a === '-f') && args[i+1]) { out.frontend = args[++i] }
    else if ((a === '--backend' || a === '-b') && args[i+1]) { out.backend = args[++i] }
    else if (a === '--help' || a === '-h') { usage(); process.exit(0) }
  }
  return out
}

async function walk(dir, exts = []) {
  const results = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const ent of entries) {
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        results.push(...await walk(full, exts))
      } else {
        if (exts.length === 0 || exts.includes(path.extname(ent.name))) results.push(full)
      }
    }
  } catch (err) {
    // ignore missing dirs
  }
  return results
}

function normalizeEndpoint(ep) {
  // remove query strings and trailing slashes
  return ep.split(/[\s"'`]/)[0].replace(/\?.*$/, '').replace(/\/+$/, '')
}

async function main() {
  const { frontend, backend } = parseArgs()
  const cwd = process.cwd()
  const frontendDir = path.resolve(cwd, frontend)
  const backendDir = path.resolve(cwd, backend)

  console.log(`Scanning frontend: ${frontendDir}`)
  console.log(`Scanning backend: ${backendDir}`)

  const frontFiles = await walk(frontendDir, ['.ts', '.tsx', '.js', '.jsx'])
  const endpoints = new Set()
  const re = /\/v1[\w\-\/\{\}\:\.%]+/g
  for (const f of frontFiles) {
    try {
      const txt = await fs.readFile(f, 'utf8')
      const matches = txt.match(re)
      if (matches) for (const m of matches) endpoints.add(normalizeEndpoint(m))
    } catch (e) {}
  }

  if (endpoints.size === 0) {
    console.log('No /v1 endpoints found in frontend sources. Nothing to check.')
    process.exit(0)
  }

  const backendFiles = await walk(backendDir, ['.java', '.properties', '.yml', '.yaml'])
  const backendIndex = new Map()
  for (const bf of backendFiles) {
    try {
      const txt = await fs.readFile(bf, 'utf8')
      backendIndex.set(bf, txt)
    } catch (e) {}
  }

  const missing = []
  for (const ep of Array.from(endpoints).sort()) {
    let found = false
    for (const [bf, txt] of backendIndex) {
      if (txt.includes(ep)) { found = true; break }
    }
    if (!found) missing.push(ep)
  }

  console.log(`Found ${endpoints.size} unique frontend /v1 endpoints.`)
  if (missing.length === 0) {
    console.log('All frontend endpoints have a matching backend occurrence. OK.')
    process.exit(0)
  }

  console.error('Unmatched frontend endpoints (no occurrence found in backend sources):')
  for (const m of missing) console.error(' -', m)
  console.error('\nPlease verify these endpoints are implemented in the backend or hide the frontend routes behind feature flags.')
  process.exit(2)
}

main().catch(err => { console.error(err); process.exit(3) })
