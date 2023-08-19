'use client'

import { handleTwitterSubmit } from '../utils/actions'
import {useRouter} from 'next/navigation'
import { motion } from 'framer-motion'

export default function Page() {
  const router = useRouter()

    //component that prompts user for twitter name and then executes handleTwitterSubmit() server action as well as redirects to dynamic model route for the specified user
    return (
        <>
            <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}>
                <form action={handleTwitterSubmit} onSubmit={(e) => {router.push('model/' + e.target.elements.twitterAccount.value)}} className="flex flex-col items-center">
                    <label className="text-lg font-medium mb-2">
                        Twitter account:
                        <input
                        type="text"
                        name="twitterAccount"
                        className="border border-gray-300 rounded-md px-3 py-1 text-black"
                        />
                    </label>
                    <input
                        type="submit"
                        value="Submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    />
                </form>
            </motion.div>
        </>
  )
}