export default function Page() {
    return (
        <>
            <h1 className="mx-4 mt-36 font-n27-bold">ADMIN PAGE</h1>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => startTransition(() => clearUsers())}>clear users</button>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => startTransition(() => clearModels())}>clear models</button>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => startTransition(() => clearPrints())}>clear prints</button><br/><br/>
            <button className="mx-4 mt-8 border border-white font-n27-light rounded-md p-2" onClick={() => startTransition(() => setTemps())}>set init printer temp</button>
        </>
    )
}

//clear db
//start printer temp maintain