/*TODO
  [x] set up stl export on button press
  [x] implement db
  [x] create one big midi handler js helper file
  [x] create print queue that waits for user input on the 3d printer screen before printing next print job
  [x] buy extra buildplate?
  [x] create print queue component that contains print job components with a preview of the model
  [x] create slicing process that puts multiple models on the same buildplate (use --marge header in prusaslicer cli)
  [ ] 3d print cover for midi controller
  [x] stickers - https://thestickybrand.com/products/try-out-our-vinyl-custom-stickers-for-a-limited-time-get-100-2-5custom-vinyl-die-cut-stickers-for-19-00
  [ ] pretty everything up
  [ ] create rainbow shader for models
  [x] create white gridline plane
  [ ] maybe lighting shader?
  [ ] create ufo model
  [ ] create cactus model
  [ ] create landscape model
  [x] do exhibit simulation test
  [ ] test on tvs
  [ ] calibrate 3d printer
  [ ] generate .ini file for prusaslicer cli
  [ ] static cmd info panel
*/
'use client'

import { handleTwitterSubmit } from './actions'
import {useRouter} from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
// import RandomText from './components/RandomText'

export default function Page() {
    const router = useRouter()
    const inputRef = useRef()

    const handleTwitterSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const res = await fetch('/api/handletwittersubmit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({twitterAccount: formData.get('twitterAccount')})
        }).catch(err => {
            console.error(err)
        })
        if (!res.ok) {
            console.error('handle twitter submit error: ', res.status)
        }
        const data = await res.json()
        router.push(data.redirectUrl)
    }

    useEffect(() => {
        inputRef.current.focus()
    }, [])

    //component that prompts user for twitter name and then executes handleTwitterSubmit() server action as well as redirects to dynamic model route for the specified user
    return (
        <>
            <motion.div
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            exit={{opacity: 1}}
            transition={{ duration: 1}}
            className="flex justify-center h-full w-full items-center">
                <form onSubmit={handleTwitterSubmit} className="flex flex-col gap-2">
                    <label className="mb-2 text-5xl">
                        <span className="font-n27-extralight">TWITTER_</span><span className="font-n27-regular">USERNAME:</span>
                    </label>
                    <input
                        type="text"
                        name="twitterAccount"
                        className={`rounded-2xl p-2 bg-black text-3xl outline-none shadow-lg shadow-white border border-white font-n27-regular lowercase`}
                        ref={inputRef}
                        />
                </form>
            </motion.div>
        </>
  )
}

// onSubmit={(e) => {
//     //e.preventDefault()
//     //router.push('model/' + (e.target.elements.twitterAccount.value).replace(/^@/, ''))
// }}