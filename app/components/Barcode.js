import JsBarcode from 'jsbarcode'
import { useEffect, useRef } from 'react'

export default function Barcode({value}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      JsBarcode(canvasRef.current, value)
    }
  }, [value])

  return (
    <canvas
      ref={canvasRef}
      className="h-2/3 w-48 absolute top-0 right-0 rounded-lg my-4 mr-4"
    />
  )
}