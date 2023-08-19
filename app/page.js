/*TODO
  [x] set up stl export on button press
  [ ] implement db
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

import Link from "next/link"
import { motion } from "framer-motion"

export default function Page() {
  //button with link to twitter prompt page
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}>
        <Link href={"/welcome"}>
          <button>start</button>
        </Link>
      </motion.div>
    </>
  )
}