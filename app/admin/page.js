'use client'

export default function Page() {

    const clearDB = async () => {
        await fetch('/api/cleardb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    const clearJobQueue = async () => {
        await fetch('http://localhost:3000/clearjobqueue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    return (
        <>
            <h1 className="mx-4 mt-36 font-n27-bold">ADMIN PAGE</h1>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => clearDB()}>clear db</button>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => clearJobQueue()}>clear job queue</button>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => clearJobQueue()}>remove active job</button>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => clearJobQueue()}>restart active job</button>
        </>
    )
}

//clear db
//start printer temp maintain
{/* <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={setTemps()}>set init printer temp</button> */}