"use client"

import { useEffect, useRef, useState } from "react"
import { PanoramaPosition, PluginConstructor, Point, Position, SphericalPosition, Viewer } from "@photo-sphere-viewer/core"
import { LensflarePlugin, ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

import { MouseEventHandler, RenderedScene } from "@/types"

import { useImageDimension } from "@/lib/useImageDimension"
import { lightSourceNames } from "@/lib/lightSourceNames"

type PhotoSpherePlugin = (PluginConstructor | [PluginConstructor, any])

export function SphericalImage({
  rendered,
  onEvent,
  className,
  debug,
}: {
  rendered: RenderedScene
  onEvent: MouseEventHandler
  className?: string
  debug?: boolean
}) {


  const imageDimension = useImageDimension(rendered.assetUrl)
  const maskDimension = useImageDimension(rendered.maskUrl)

  const sceneConfig = JSON.stringify({ rendered, debug, imageDimension, maskDimension })
  const [lastSceneConfig, setLastSceneConfig] = useState<string>(sceneConfig)
  const rootContainerRef = useRef<HTMLDivElement>(null)
  const viewerContainerRef = useRef<HTMLElement>()
  const viewerRef = useRef<Viewer>()
  const [mouseMoved, setMouseMoved] = useState<boolean>(false)

  const defaultZoomLvl = 1 // 0 = 180 fov, 100 = 1 fov

  const options = {
    defaultZoomLvl,
    fisheye: false, // ..no!
    overlay: rendered.maskUrl || undefined,
    overlayOpacity: debug ? 0.5 : 0,
    /*
    panoData: {
      fullWidth: 2000,
      fullHeight: 1200,
      croppedWidth: 1024,
      croppedHeight: 512,
      croppedX: 0,
      croppedY: 200,
      // poseHeading: 0, // 0 to 360
      posePitch: 0, // -90 to 90
      // poseRoll: 0, // -180 to 180
    }
    */
  }


  const cacheRef = useRef("")
  useEffect(() => {
    const listener = (e: DragEvent) => {
      if (!rootContainerRef.current) { return }

      // TODO: check if we are currently dragging an object
      // if yes, then we should check if clientX and clientY are matching the 
      const boundingRect = rootContainerRef.current.getBoundingClientRect()

      // abort if we are not currently dragging over our display area
      if (e.clientX < boundingRect.left) { return }
      if (e.clientX > (boundingRect.left + boundingRect.width)) { return }
      if (e.clientY < boundingRect.top) { return }
      if (e.clientY > (boundingRect.top + boundingRect.height)) { return }

      const containerX = e.clientX - boundingRect.left
      const containerY = e.clientY - boundingRect.top
    
      const relativeX = containerX / boundingRect.width
      const relativeY = containerY / boundingRect.height

      const key = `${relativeX},${relativeY}`

      // to avoid use
      if (cacheRef.current === key) {
        return
      }
      // console.log(`DRAG: calling onEvent("hover", ${relativeX}, ${relativeY})`)

      cacheRef.current = key
      onEvent("hover", relativeX, relativeY)
    }

    document.addEventListener('drag', listener)

    return () => {
      document.removeEventListener('drag', listener)
    }
  }, [onEvent])

  useEffect(() => {
    const task = async () => {
      // console.log("SphericalImage: useEffect")
      if (sceneConfig !== lastSceneConfig) {
        // console.log("SphericalImage: scene config changed!")
    
        if (!viewerRef.current) {
          // console.log("SphericalImage: no ref!")
          setLastSceneConfig(sceneConfig)
          return
        }
        const viewer = viewerRef.current

        const newOptions = {
          ...options,
        }

        const lensflares: { id: string; position: SphericalPosition; type: number }[] = []
          
        if (maskDimension.width && imageDimension.width) {

          // console.log("rendered.segments:", rendered.segments)
   
          rendered.segments
            .filter(segment => lightSourceNames.includes(segment.label))
            .forEach(light => {
            // console.log("light detected", light)
            const [x1, y1, x2, y2] = light.box
            const [centerX, centerY] = [(x1 + x2) / 2, (y1 + y2) / 2]
            // console.log("center:", { centerX, centerY })
            const [relativeX, relativeY] = [centerX / maskDimension.width, centerY/ maskDimension.height]
            // console.log("relative:", { relativeX, relativeY})

            const panoramaPosition: PanoramaPosition = {
              textureX: relativeX * imageDimension.width,
              textureY: relativeY * imageDimension.height
            }
            // console.log("panoramaPosition:", panoramaPosition)

            const position = viewer.dataHelper.textureCoordsToSphericalCoords(panoramaPosition)
            // console.log("sphericalPosition:", position)
            if ( // make sure coordinates are valid
              !isNaN(position.pitch) && isFinite(position.pitch) &&
              !isNaN(position.yaw) && isFinite(position.yaw)) {
              lensflares.push({
                id: `flare_${lensflares.length}`,
                position,
                type: 0,
              })
            }
          })
        }

        // console.log("lensflares:", lensflares)
        const lensFlarePlugin = viewer.getPlugin<LensflarePlugin>("lensflare")
        lensFlarePlugin.setLensflares(lensflares)

        // console.log("SphericalImage: calling setOptions")
        // console.log("SphericalImage: changing the panorama to: " + rendered.assetUrl.slice(0, 120))
      
        await viewer.setPanorama(rendered.assetUrl, {
          ...newOptions,
          showLoader: false,
        })

        // TODO we should separate all those updates, probaby
        viewer.setOptions(newOptions)
        // viewer.setOverlay(rendered.maskUrl || undefined)

        // console.log("SphericalImage: asking to re-render")
        viewerRef.current.needsUpdate()

        setLastSceneConfig(sceneConfig)
      }
    }
    task()
  }, [sceneConfig, rendered.assetUrl, viewerRef.current, maskDimension.width, imageDimension])

  const handleEvent = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>, isClick: boolean) => {
    const rootContainer = rootContainerRef.current
    const viewer = viewerRef.current
    const viewerContainer = viewerContainerRef.current

    /*
    if (isClick) console.log(`handleEvent(${isClick})`, {
      " imageDimension.width": imageDimension.width,
      "rendered.maskUrl": rendered.maskUrl
    })
    */
  
    if (!viewer || !rootContainer || !viewerContainer || !imageDimension.width || !rendered.maskUrl) {
      return
    }

    const containerRect = viewerContainer.getBoundingClientRect()
    // if (isClick) console.log("containerRect:", containerRect)

    const containerY = event.clientY - containerRect.top
    // console.log("containerY:", containerY)
    
    const position: Position = viewer.getPosition()

    const viewerPosition: Point = viewer.dataHelper.sphericalCoordsToViewerCoords(position)
    // if (isClick) console.log("viewerPosition:", viewerPosition)

    // we want to ignore events that are happening in the toolbar
    // note that we will probably hide this toolbar at some point,
    // to implement our own UI
    if (isClick && containerY > (containerRect.height - 40)) {
      // console.log("we are in the toolbar.. ignoring the click")
      return
    }

    const panoramaPosition: PanoramaPosition = viewer.dataHelper.sphericalCoordsToTextureCoords(position)

    if (typeof panoramaPosition.textureX !== "number" || typeof panoramaPosition.textureY !== "number") {
      return
    }
    
    const relativeX = panoramaPosition.textureX / imageDimension.width
    const relativeY = panoramaPosition.textureY / imageDimension.height

    onEvent(isClick ? "click" : "hover", relativeX, relativeY)
  }

  if (!rendered.assetUrl) {
    return null
  }

  return (
    <div
      ref={rootContainerRef}
      onMouseMove={(event) => {
        handleEvent(event, false)
        setMouseMoved(true)
      }}
      onMouseUp={(event) => {
        if (!mouseMoved) {
          handleEvent(event, true)
        }
        setMouseMoved(false)
      }}
      onMouseDown={() => {
        setMouseMoved(false)
      }}
      >
      <ReactPhotoSphereViewer
        src={rendered.assetUrl}
        container=""
        containerClass={className}
        
        height="100vh"
        width="100%"
        
        // to access a plugin we must use viewer.getPlugin()
        plugins={[[LensflarePlugin, { lensflares: [] }]]}

        {...options}

        // note: photo sphere viewer performs an aggressive caching of our callbacks,
        // so we aggressively disable it by using a ref
        onClick={() => {
          // nothing to do here
        }}
    
        onReady={(instance) => {
          viewerRef.current = instance
          viewerContainerRef.current = instance.container

          /*
          const markersPlugs = instance.getPlugin(MarkersPlugin);
          if (!markersPlugs)
            return;
          markersPlugs.addMarker({
            id: "imageLayer2",
            imageLayer: "drone.png",
            size: { width: 220, height: 220 },
            position: { yaw: '130.5deg', pitch: '-0.1deg' },
            tooltip: "Image embedded in the scene"
          });
          markersPlugs.addEventListener("select-marker", () => {
            console.log("asd");
          });
          */
        }}

      />
    </div>
  )
}