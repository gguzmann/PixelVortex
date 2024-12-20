import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
import { Pixel } from "./Pixel";
import { PixelCanvas } from "./CanvasPixel";
import * as THREE from 'three'
import { Merged } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const Scene = ({ exportScene, setExportScene, optimize, setOptimize, pixels }: { exportScene: boolean, setExportScene:  (value: boolean) => void, optimize: boolean, setOptimize:  (value: boolean) => void, pixels: PixelCanvas[] }) => {
    const { scene } = useThree()
    const groupRef = useRef(null)
    useEffect(() => {
        if (optimize) {

            const contarObjetos = (obj: THREE.Object3D) => {
                let count = 0

                obj.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        console.log(child);
                        console.log(child.position);
                        count++;
                      }
                })

                console.log(count)
            }

            contarObjetos(scene)
            setOptimize(false)
        }
    }, [optimize])

    useEffect(() => {
        const exportToGLTF = () => {
            const geometries = pixels
            .filter((p) => p.color !== "rgba(0,0,0,0)")
            .map((pixel) => {
              // Crear una geometría para el píxel
              const geometry = new THREE.BoxGeometry(1, 1, 1);

              geometry.scale(.1, .1, .1 * pixel.count);
              geometry.translate(pixel.x/ 10 - .8, pixel.y/ 10 - .8, 0);

          
              // Convertir el color a un vector de THREE.Color
              const color = new THREE.Color(pixel.color);
          
              // Crear un atributo de color para los vértices
              const colorArray = new Float32Array(geometry.attributes.position.count * 3); // R, G, B por vértice
              for (let i = 0; i < geometry.attributes.position.count; i++) {
                color.toArray(colorArray, i * 3); // Asignar el color a cada vértice
              }
          
              geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3)); // Añadir el atributo de color

              return geometry;
            });

            const mergedGeometry = mergeGeometries(
                geometries, false
              );

              
              const material = new THREE.MeshStandardMaterial({ color: "white", side: THREE.FrontSide });

              // Crear una malla combinada
              const mergedMesh = new THREE.Mesh(mergedGeometry, material);
          
            console.log('exportar')
            const exporter = new GLTFExporter()
            exporter.parse(
                mergedMesh,
                (gltf) => {
                    const output = JSON.stringify(gltf, null, 2)
                    // const blob = new Blob([output], { type: 'application/json' })
                    const blob = new Blob([JSON.stringify(gltf)], { type: "application/json" });

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
            <Merged
                meshes={[
                    new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshBasicMaterial({ color: "red" }) // Material genérico

                    ),
                ]}
                >
                {(Box) => (
                    <>
                    {
                        pixels.filter((p: PixelCanvas) => p.color !== "rgba(0,0,0,0)").map((item: PixelCanvas, i: number) =>
                            <Pixel key={i} position={[item.x, item.y, 0]} color={item.color} count={item.count} />
                        )
                    }
                    </>
                )}
            </Merged>
        </group>
    )
}
