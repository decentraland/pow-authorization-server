import { resolve } from 'path'
process.env.TS_NODE_PROJECT = resolve(__dirname, '../tsconfig.json')

// load ts-node
import 'ts-node/register'
