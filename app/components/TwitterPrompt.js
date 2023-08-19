//import { useState } from 'react'
import { handleTwitterSubmit } from '../utils/actions'


export default function TwitterPrompt({setShowModelScene, setTwitterAccount}) {
    //const [twitterAccount, setTwitterAccount] = useState('')
    return (
        <>
            <form action={handleTwitterSubmit} onSubmit={(event) => handleStates(event, setShowModelScene, setTwitterAccount)} className="flex flex-col items-center">
                <label className="text-lg font-medium mb-2">
                    Twitter account:
                    <input
                    type="text"
                    name="twitterAccount"
                    //value={twitterAccount}
                    className="border border-gray-300 rounded-md px-3 py-1 text-black"
                    />
                </label>
                <input
                    type="submit"
                    value="Submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                />
            </form>
        </>
    )
}

function handleStates(event, setShowModelScene, setTwitterAccount) {
    //event.preventDefault()
    setShowModelScene(true)
    setTwitterAccount(event.target.elements.twitterAccount.value)
}