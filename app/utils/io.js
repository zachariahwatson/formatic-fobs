import { io } from 'socket.io-client'

const globalForSocket = globalThis

export const socket = globalForSocket.socket || io(`http://localhost:${process.env.NEXT_PUBLIC_PORT}`)

if (process.env.NODE_ENV !== 'production') globalForSocket.socket = socket