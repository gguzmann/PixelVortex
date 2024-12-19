'use client'

import { Pixel } from "@/components/Pixel"
import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useState } from "react"
import { CanvasPixel, PixelCanvas } from "@/components/CanvasPixel"
import { Scene } from "@/components/Scene"

export default function App() {
  const [pixels, setPixels] = useState([])
  const [exportScene, setExportScene] = useState<boolean>(false)
  const [optimize, setOptimize] = useState<boolean>(false)

  return (
    <div className="min-h-screen flex w-100">
      <div className="flex-1 bg-slate-400">
        <CanvasPixel pixels={pixels} setPixels={setPixels} />
      </div>

      <div className="flex-1">
        <button className="absolute z-[200] mt-4 mx-10 right-0 bg-black px-3 py-2 text-white rounded" onClick={() => { setExportScene(true) }}>Descargar GLFT</button>
        {/* <button className="absolute top-14 mt-4 right-0 mx-10 z-[201] bg-black px-3 py-2 text-white rounded" onClick={() => { setOptimize(true) }}>Optimize</button> */}
        <Canvas performance={{ min: 0.5 }} camera={{ position: [0, 0, 5], up: [0, -1, 0] }} style={{ background: 'gray', height: '100vh' }}>
          <ambientLight />
          <OrbitControls />
          <Environment preset="sunset" />
          <Scene exportScene={exportScene} setExportScene={setExportScene} optimize={optimize} setOptimize={setOptimize} pixels={pixels} />

        </Canvas >

      </div>

    </div >
  )
}
