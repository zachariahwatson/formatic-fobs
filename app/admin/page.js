'use client'

export default function Page() {

    const clearDB = async () => {
        await fetch('/api/cleardb', {
            method: 'POST'
        })
    }

    return (
        <>
            <h1 className="mx-4 mt-36 font-n27-bold">ADMIN PAGE</h1>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => clearDB()}>clear db</button>
        </>
    )
}

//clear db
//start printer temp maintain
{/* <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={setTemps()}>set init printer temp</button> */}