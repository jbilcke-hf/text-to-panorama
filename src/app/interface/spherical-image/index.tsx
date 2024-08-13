"use client"

import { useEffect, useRef, useState } from "react"
import { PluginConstructor, Viewer } from "@photo-sphere-viewer/core"
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

import { useImageDimension } from "@/lib/useImageDimension"

type PhotoSpherePlugin = (PluginConstructor | [PluginConstructor, any])

export function SphericalImage({
  assetUrl,
  className,
  debug,
}: {
  assetUrl: string
  className?: string
  debug?: boolean
}) {


  const imageDimension = useImageDimension(assetUrl)

  const sceneConfig = JSON.stringify({ assetUrl, debug, imageDimension })
  const [lastSceneConfig, setLastSceneConfig] = useState<string>(sceneConfig)
  const rootContainerRef = useRef<HTMLDivElement>(null)
  const viewerContainerRef = useRef<HTMLElement>()
  const viewerRef = useRef<Viewer>()
  const [mouseMoved, setMouseMoved] = useState<boolean>(false)

  const defaultZoomLvl = 1 // 0 = 180 fov, 100 = 1 fov

  const options = {
    defaultZoomLvl,
    fisheye: false, // ..no!
    overlay:  undefined,
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

        await viewer.setPanorama(assetUrl, {
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
  }, [sceneConfig, assetUrl, viewerRef.current, imageDimension])


  if (!assetUrl) {
    return null
  }

  return (
    <div
      ref={rootContainerRef}
      >
      <ReactPhotoSphereViewer
        src={assetUrl}
        container=""
        containerClass={className}
        
        height="100vh"
        width="100%"

        {...options}

        // note: photo sphere viewer performs an aggressive caching of our callbacks,
        // so we aggressively disable it by using a ref
        onClick={() => {
          // nothing to do here
        }}
    
        onReady={(instance) => {
          viewerContainerRef.current = instance.container
        }}

      />
    </div>
  )
}