import * as THREE from "three"
export const Pixel = ({ position, color = 'red', count = 1 }: PixelProps) => {

    return (
        <mesh position={[position[0] / 10 - .8, position[1] / 10 - .8, 0]}>
            < boxGeometry args={[.1, .1, .1 * (count)]} />
            <meshStandardMaterial color={color} side={THREE.FrontSide} />
        </mesh >
    )
}


export type PixelProps = {
    position: [number, number, number],
    color?: string,
    count?: number
}