#!/usr/bin/env node
import fs from 'node:fs'

const data = await fetch('https://publicsuffix.org/list/public_suffix_list.dat').then(response => response.text())
const entries = data.split('\n').map(entry => entry.replace(/\/\/.*$/, '').trim()).filter(entry => entry != '')

await fs.promises.writeFile('js/psl.js', `export default ${JSON.stringify(entries)}`)
