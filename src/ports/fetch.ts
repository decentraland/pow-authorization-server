import { IFetchComponent } from '@well-known-components/http-server'
import nodeFetch, { RequestInfo, RequestInit, Response } from 'node-fetch'

export async function createFetchComponent() {
  const fetch: IFetchComponent = {
    async fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
      return nodeFetch(url, init)
    }
  }

  return fetch
}
