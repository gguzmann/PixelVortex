import { count } from "console"
import { useEffect, useRef, useState } from "react"
import { Box, Eraser, ImagePlus, PaintBucket, Trash2 } from "lucide-react"

const COLORS = {
    YELLOW: 'rgb(255, 165, 0)',
    RED: 'rgb(255, 0, 0)',
    BLUE: 'rgb(0, 0, 255)',
    GREEN: 'rgb(60, 179, 113)',
    BLACK: 'rgb(0, 0, 0)',
    WHITE: 'rgb(255, 255, 255)',
    ERASE: 'rgba(128,128,128,0.4235294117647059)',
    ERASE2: 'rgba(0,0,0,0)',
}
const ERASEARRAY = ['rgba(128,128,128,0.4235294117647059)', 'rgb(80,80,80)', 'rgb(255,255,255)', 'rgb(0,0,0)']
export const CanvasPixel = ({ pixels, setPixels }: { pixels: any, setPixels: any }) => {
    const [isDrawing, setIsDrawing] = useState(false)
    const [isDrawingRight, setIsDrawingRight] = useState(false)
    const [color, setColor] = useState(COLORS.BLACK)
    const [numDepth, setNumDepth] = useState(1)
    const [hoverPixel, setHoverPixel] = useState<{ x: number, y: number } | null>(null)

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasGrillaRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const logicalSize = 16; // Dimensiones de la cuadrícula lógica
    const physicalSize = 256; // Tamaño físico del canvas
    const scaleFactor = physicalSize / logicalSize;


    useEffect(() => {
        if (!ctxRef.current) return
        redraw()

        if (hoverPixel) {
            ctxRef.current.fillStyle = 'rgba(255,255,255,.5)'

            ctxRef.current.fillRect(hoverPixel.x, hoverPixel.y, 1, 1)
            ctxRef.current.strokeStyle = 'black'
            ctxRef.current.lineWidth = .1
            ctxRef.current.strokeRect(hoverPixel.x, hoverPixel.y, 1, 1);
        }



    }, [hoverPixel])

    const redraw = () => {
        if (!ctxRef.current) return
        ctxRef.current.clearRect(0, 0, physicalSize, physicalSize)

        for (let x = 0; x < logicalSize; x++) {
            for (let y = 0; y < logicalSize; y++) {

                const exist = pixels.find((p: PixelCanvas) => p.x === x && p.y === y)
                if (exist?.color !== COLORS.ERASE2) {
                    ctxRef.current.fillStyle = exist.color
                } else {
                    ctxRef.current.fillStyle = COLORS.ERASE2

                }
                ctxRef.current.fillRect(x, y, 1, 1);

            }
        }
    }

    useEffect(() => {
        if (!canvasRef.current) return
        ctxRef.current = canvasRef.current.getContext("2d")

        if (!ctxRef.current) return;

        // Evitar difuminado en el canvas (clave para pixel art)
        ctxRef.current.imageSmoothingEnabled = false;
        // Escala el canvas para que cada unidad lógica sea un "píxel" de la cuadrícula
        ctxRef.current.scale(scaleFactor, scaleFactor);
        ctxRef.current.lineWidth = 0.03; // Asegura que las líneas sean visibles incluso si la escala es alta

        // Dibuja la cuadrícula
        ctxRef.current.strokeStyle = COLORS.ERASE2;
        for (let x = 0; x <= logicalSize; x++) {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(x, 0);
            ctxRef.current.lineTo(x, logicalSize);
            ctxRef.current.stroke();
        }
        for (let y = 0; y <= logicalSize; y++) {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(0, y);
            ctxRef.current.lineTo(logicalSize, y);
            ctxRef.current.stroke();
        }

        // for (let x = 0; x < logicalSize; x++) {
        //     for (let y = 0; y < logicalSize; y++) {
        //         // Alternar colores en patrón de tablero
        //         if ((x + y) % 2 === 0) {
        //             ctxRef.current.fillStyle = "white"; // Color del primer cuadro
        //         } else {
        //             ctxRef.current.fillStyle = "rgba(0, 0, 0, 0.1)"; // Color del segundo cuadro (gris claro con opacidad)
        //         }
        //         ctxRef.current.fillRect(x * 1, y * 1, 1, 1);
        //     }
        // }

        loadImage3d()
    }, [canvasRef])


    const startDrawing = (event: any) => {
        if (!canvasRef.current) return
        console.log(event.button)
        if (event.button == 0) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / scaleFactor);
            const y = Math.floor((event.clientY - rect.top) / scaleFactor);
            setIsDrawing(true)
            addPixel(x, y)
        } else if (event.button === 2) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / scaleFactor);
            const y = Math.floor((event.clientY - rect.top) / scaleFactor);
            const updatedPixels = pixels.map((pix: PixelCanvas) => {
                if (pix.x === x && pix.y === y) {
                    // Incrementar el count si encuentra el píxel
                    return { ...pix, count: numDepth };
                }
                return pix; // Devolver el píxel sin cambios si no coincide
            });
            setPixels(updatedPixels);
            setIsDrawingRight(true)
        }
    }

    const draw = (event: any) => {
        if (!canvasRef.current) return
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / scaleFactor);
        const y = Math.floor((event.clientY - rect.top) / scaleFactor);
        setHoverPixel({ x, y })


        if (isDrawing) {
            addPixel(x, y)
        }
        if (isDrawingRight) {
            const updatedPixels = pixels.map((pix: PixelCanvas) => {
                if (pix.x === x && pix.y === y) {
                    // Incrementar el count si encuentra el píxel
                    return { ...pix, count: numDepth };
                }
                return pix; // Devolver el píxel sin cambios si no coincide
            });
            setPixels(updatedPixels);
        }
    }

    const stopDrawing = () => {
        if (!ctxRef.current) return

        ctxRef.current.closePath(); // Termina el trazo
        setIsDrawing(false);
        setIsDrawingRight(false);
        setHoverPixel(null)
    };

    const addPixel = (x: number, y: number) => {
        if (!ctxRef.current) return

        ctxRef.current.beginPath(); // Inicia un nuevo trazo
        ctxRef.current.moveTo(x, y); // Mueve a la posición inicial

        // Establecer el color del lápiz
        ctxRef.current.fillStyle = color;
        ctxRef.current.fillRect(x, y, 1, 1);

        const updatedPixels = pixels.map((pix: PixelCanvas) => {
            if (pix.x === x && pix.y === y) {

                return { ...pix, color, count: numDepth };
            }
            return pix;
        });

        setPixels(updatedPixels)
        console.log(pixels.length)
    }

    const loadImage = (sprite: string) => {
        if (!ctxRef.current) return
        setPixels([])
        //  Cargar y dibujar la imagen en el canvas
        const image = new Image();
        image.src = "/" + sprite + ".png"; // Cambia esto por la ruta de tu imagen de 16x16
        image.onload = () => {
            if (!ctxRef.current) return

            ctxRef.current.drawImage(image, 0, 0, logicalSize, logicalSize);
            loadImage3d(true)
        }
    }

    const loadImage3d = (load = false) => {
        if (!ctxRef.current) return
        const pixelDataArray = [];

        for (let y = 0; y < logicalSize; y++) {
            for (let x = 0; x < logicalSize; x++) {
                const physicalX = Math.floor(x * scaleFactor);
                const physicalY = Math.floor(y * scaleFactor);

                const imageData = ctxRef.current.getImageData(physicalX, physicalY, 1, 1);
                const pixel = imageData.data;

                const r = pixel[0];
                const g = pixel[1];
                const b = pixel[2];
                const colorImage = ERASEARRAY.includes(`rgb(${r},${g},${b})`) ? COLORS.ERASE2 : `rgb(${r},${g},${b})`
                pixelDataArray.push({
                    x,
                    y,
                    color: load ? colorImage : COLORS.ERASE2,
                    count: 1
                });

            }
        }
        console.log(pixelDataArray)
        setPixels(pixelDataArray);
    }

    const eraseDraw = () => {
        if (!ctxRef.current) return

        loadImage3d()
        ctxRef.current.clearRect(0, 0, physicalSize, physicalSize)
    }

    const fillArea = () => {
        if (!ctxRef.current) return


        const updatedPixels = pixels.map((pix: PixelCanvas) => {
            if (pix.color === pixels[0].color) {
                // Incrementar el count si encuentra el píxel
                return { ...pix, color: COLORS.ERASE2 };
            }
            return pix; // Devolver el píxel sin cambios si no coincide
        });
        setPixels(updatedPixels);
        redraw()

    }

    const fillBox = () => {
        const updatedPixels = pixels.map((pix: PixelCanvas) => ({ ...pix, count: 16 }));
        setPixels(updatedPixels);
        redraw()

    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-wrap flex-col gap-1 h-[300px]">

                {
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num: number) =>
                        <button
                            key={num}
                            className={`h-7 w-7 rounded flex items-center justify-center text-white
                                 bg-slate-500 hover:bg-slate-200 ${numDepth === num ? 'border-2' : 'none'}`}
                            onClick={() => setNumDepth(num)}
                        >{num}</button>
                    )
                }

                <Box className="h-7 w-7 rounded flex items-center justify-center text-white
                                 bg-slate-500 hover:bg-slate-200 cursor-pointer"
                    onClick={() => fillBox()}
                />
            </div>
            <div>

                <div className="flex gap-1 justify-center">
                    <div className="text-white bg-black rounded p-2 cursor-pointer hover:bg-opacity-55" onClick={() => eraseDraw()}><Trash2 /></div>
                    <div className="text-white bg-black rounded p-2 cursor-pointer hover:bg-opacity-55" onClick={() => { loadImage('mage') }}><ImagePlus /></div>
                    <div className="text-white bg-black rounded p-2 cursor-pointer hover:bg-opacity-55" onClick={() => { fillArea() }}><PaintBucket /></div>
                </div>
                <canvas
                    className="border-2 bg-white bg-opacity-35 border-yellow-500 rounded m-5"
                    style={{ backgroundImage: "linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)", backgroundSize: "32px 32px", backgroundPosition: "0 0, 0 16px, 16px -16px, -16px 0px" }}
                    width={physicalSize}
                    height={physicalSize}
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onContextMenu={(e: any) => e.preventDefault()}
                    onMouseMove={(e: any) => draw(e)}
                    onMouseUp={() => stopDrawing()}
                    onMouseLeave={() => stopDrawing()}
                />
            </div >


            <div className="flex flex-col gap-1">
                {
                    Object.values(COLORS).filter((c:string) => c!== COLORS.ERASE2).map((col: string, index: number) =>
                        <div
                            key={col}
                            style={{ background: col }}
                            onClick={() => setColor(col)}
                            className={`h-7 w-7 rounded ${color === col ? 'border-2' : 'none'} ${col === COLORS.ERASE2 ? 'd-none' : 'bg-white'} `} />
                    )
                }
                <div className={`h-7 w-7 rounded ${color === COLORS.ERASE2 ? 'border-2' : 'none'} border-yellow-500 bg-gray `}
                    onClick={() => setColor(COLORS.ERASE2)}
                >
                    <Eraser />
                </div>

            </div>
        </div >
    )
}



export type PixelCanvas = {
    x: number,
    y: number,
    count: number,
    color: string,
}