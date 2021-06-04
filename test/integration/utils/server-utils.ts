import { Lifecycle } from '@well-known-components/interfaces'
import fetch, { Response } from 'node-fetch'
import { initComponents } from '../../../src/components'
import { main } from '../../../src/service'
import { AppComponents } from '../../../src/types'

export async function startApp(): Promise<Lifecycle.ComponentBasedProgram<AppComponents>> {
  return await Lifecycle.run({ main, initComponents })
}

export async function fetchLocalHost(path: string): Promise<Response> {
  return await fetch(`http://0.0.0.0:5000${path}`)
}

export async function postLocalHost(path: string, body?: any): Promise<Response> {
  return await fetch(`http://0.0.0.0:5000${path}`, {
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
}
