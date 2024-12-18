import { motion } from "framer-motion"
export default function ProgressBar({ progress }) {
	return (
		<div className="w-full h-full relative overflow-hidden outline-none shadow-md shadow-white border border-white rounded-2xl">
			<div
				className="rounded-2xl w-full h-full absolute top-0 left-0 z-10"
				style={{ clipPath: "inset(0 round .75rem)" }}
			>
				<motion.div
					className="h-full rainbow rounded-xl absolute top-0 left-0 z-0 flex justify-center items-center"
					style={{ width: `${progress}%` }}
					initial={{ width: "0%" }}
					animate={{ width: `${progress}%` }}
					transition={{ type: "tween", ease: [0.6, 0.05, 0.5, 1], duration: 0.5 }}
				>
					{progress >= 10 && <p className="font-n27-extralight text-md opacity-50">{progress}%</p>}
				</motion.div>
			</div>
		</div>
	)
}
