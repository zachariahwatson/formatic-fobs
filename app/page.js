/*TODO
  [x] set up stl export on button press
  [ ] implement db
  [x] create one big midi handler js helper file
  [ ] create print queue that waits for user input on the 3d printer screen before printing next print job
  [ ] buy extra buildplate?
  [ ] create print queue component that contains print job components with a preview of the model
  [ ] create slicing process that puts multiple models on the same buildplate (use --marge header in prusaslicer cli)
  [ ] 3d print cover for midi controller
  [ ] stickers - https://thestickybrand.com/products/try-out-our-vinyl-custom-stickers-for-a-limited-time-get-100-2-5custom-vinyl-die-cut-stickers-for-19-00
  [ ] pretty everything up
  [ ] create rainbow shader for models
  [ ] create white gridline plane
  [ ] maybe lighting shader?
  [ ] create ufo model
  [ ] create cactus model
  [ ] create landscape model
  [ ] do exhibit simulation test
  [ ] test on tvs
  [ ] calibrate 3d printer
  [ ] generate .ini file for prusaslicer cli
*/
'use client'

import { handleTwitterSubmit } from './actions'
import {useRouter} from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
// import RandomText from './components/RandomText'

export default function Page() {
    const router = useRouter()
    const inputRef = useRef()

    useEffect(() => {
        inputRef.current.focus()
    }, [])

    //component that prompts user for twitter name and then executes handleTwitterSubmit() server action as well as redirects to dynamic model route for the specified user
    return (
        <>
            <motion.div
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
            transition={{ duration: 1}}
            className="flex justify-center h-screen items-center">
                <form action={handleTwitterSubmit} onSubmit={(e) => {router.push('model/' + (e.target.elements.twitterAccount.value).replace(/^@/, ''))}} className="flex flex-col gap-2">
                    <label className="mb-2 text-8xl font-gridularRegular text-center">
                        TWITTER USERNAME:
                    </label>
                    <input
                        type="text"
                        name="twitterAccount"
                        className={`rounded-2xl p-5 bg-black text-4xl outline-none shadow-lg shadow-white border border-white font-gridularRegular lowercase text-center`}
                        ref={inputRef}
                        />
                </form>
            </motion.div>
        </>
  )
}