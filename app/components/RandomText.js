import styles from './randomFonts.module.css'
import { useState, useEffect } from 'react'

const fonts = [
  styles.arkEsSolidRegular,
  styles.betatronRegular,
  // styles.fablab,
  styles.generalestationRegular,
  styles.gridularRegular,
  styles.handjet,
  styles.meyrin,
  styles.monoBiletikRegular10,
  // styles.panameraBold,
  // styles.panameraHeavy,
  // styles.panameraLight,
  // styles.panameraMedium,
  // styles.panameraRegular,
  // styles.panameraThin,
  styles.pilowlavaRegular,
  styles.radio
]

export default function RandomText({ text, isSwitching }) {
  const [randomText, setRandomText] = useState('')

  useEffect(() => {
    const updateText = () => {
      const words = text.split(' ')
      const newWords = words.map((word) => {
        // randomize case
        const newWord = Math.random() < .5 ? word.toLowerCase() : word.toUpperCase()
        // randomize font family
        const fontFamily = fonts[Math.floor(Math.random() * fonts.length)]
        //console.log(fontFamily)

        return (
          <span key={word} className={fontFamily}>
            {`${newWord} `}
          </span>
        )
      })
      setRandomText(newWords)
    }

    updateText()

    if (isSwitching) {
      const interval = setInterval(updateText, 2000)
      return () => clearInterval(interval)
    }
  }, [text])

  return <p>{randomText}</p>
}