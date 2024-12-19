import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
import { Pixel } from "./Pixel";
import { PixelCanvas } from "./CanvasPixel";
export const Scene = ({ exportScene, setExportScene, optimize, setOptimize, pixels }: { exportScene: boolean, setExportScene:  (value: boolean) => void, optimize: boolean, setOptimize:  (value: boolean) => void, pixels: PixelCanvas[] }) => {
    const { scene } = useThree()
    const groupRef = useRef(null)
    useEffect(() => {
        if (optimize) {

            const contarObjetos = (obj) => {
                let count = 0

                obj.traverse((child) => {
                    console.log(child)
                    console.log(child.position)
                    if (child.isMesh) count++
                })

                console.log(count)
            }

            contarObjetos(scene)
            setOptimize(false)
        }
    }, [optimize])

    useEffect(() => {
        const exportToGLTF = () => {
            console.log('exportar')
            const exporter = new GLTFExporter()
            exporter.parse(
                scene,
                (gltf) => {
                    const output = JSON.stringify(gltf, null, 2)
                    const blob = new Blob([output], { type: 'application/json' })
                    console.log(blob)
                    const url = URL.createObjectURL(blob)

                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'test.gltf'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                },
                (error) => {
                    console.error('An error happened during the export', error)
                },
                { binary: false }
            )
        }

        if (exportScene) {
            exportToGLTF()
            setExportScene(false)
        }
    }, [scene, exportScene])

    useFrame(() => {
        if (groupRef.current) {
            // groupRef.current.rotation.y += 0.01;
        }
    })
    return (
        <group ref={groupRef} position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}>
            {
                pixels.filter((p: PixelCanvas) => p.color !== "rgba(0,0,0,0)").map((item: PixelCanvas, i: number) =>
                    <Pixel key={i} position={[item.x, item.y, 0]} color={item.color} count={item.count} />
                )
                // )
            }
        </group>
    )
}
