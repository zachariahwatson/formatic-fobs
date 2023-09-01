import { io } from "socket.io-client"

export const socket = io(`http://localhost:${process.env.NEXT_PUBLIC_PORT}`)