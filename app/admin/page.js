'use client'

import { clearDB } from "../actions"
import { useTransition } from "react"

export default function Page() {
    const [isPending, startTransition] = useTransition()

    return (
        <>
            <h1 className="mx-4 mt-36 font-n27-bold">ADMIN PAGE</h1>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => startTransition(() => clearDB())}>clear db</button>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => startTransition(() => setTemps())}>set init printer temp</button>
        </>
    )
}

//clear db
//start printer temp maintain