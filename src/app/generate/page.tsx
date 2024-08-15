"use client"

import { Suspense, useEffect, useTransition } from "react"

import { cn } from "@/lib/utils"
import { TopMenu } from "../interface/top-menu"
import { fonts } from "@/lib/fonts"

import { useStore } from "../store"
import { BottomBar } from "../interface/bottom-bar"
import { SphericalImage } from "../interface/spherical-image"
import { getPanoramaFlux } from "../engine/getPanoramaFlux"
import { getPost } from "../engine/community"
import { useSearchParams } from "next/navigation"
import { fuseEdges } from "@/lib/fuseEdges"

function PageContent() {
  const searchParams = useSearchParams()
  const [_isPending, startTransition] = useTransition()
  const postId = (searchParams.get("postId") as string) || ""

  const prompt = useStore(s => s.prompt)
  const setPrompt = useStore(s => s.setPrompt)
  const assetUrl = useStore(s => s.assetUrl)
  const setAssetUrl = useStore(s => s.setAssetUrl)
  const isLoading = useStore(s => s.isLoading)
  const setLoading = useStore(s => s.setLoading)


  // react to prompt changes
  useEffect(() => {
    if (!prompt) { return }

    // to prevent loading a new prompt if we are already loading
    // (eg. the initial one, from a community post)
    // if (isLoading) { return }

    startTransition(async () => {
      try {

        //width: 2048,
         //height: 1024,
        const width = 1600
        const height = 640
  
        const rawAssetUrl = await getPanoramaFlux({ prompt, width, height })

        const assetUrl = await fuseEdges({
          base64DataUriInput: rawAssetUrl,
          inputWidth: width,
          inputHeight: height,
          outputWidth: width - 32
        })

        if (assetUrl) {
          setAssetUrl(assetUrl)
          setLoading(false)
        } else {
          console.log(`panorama got an error and/or an empty asset url`)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })
  }, [prompt]) // important: we need to react to preset changes too

  useEffect(() => {
    if (!postId) {
      return
    }
    setLoading(true)

    startTransition(async () => {
      try {
        console.log(`loading post ${postId}`)
        const post = await getPost(postId)

        // setting the prompt here will mess-up with everything
        // normally this shouldn't trigger the normal prompt update workflow,
        // because we are set the app to "is loading"
        // setPrompt(post.prompt)

        setAssetUrl(post.assetUrl)
        setLoading(false)
      } catch (err) {
        console.error("failed to get post: ", err)
        setLoading(false)
      }
    })
  }, [postId])

  return (
    <>
      <div className={cn(
        `fixed inset-0 w-screen h-screen overflow-y-scroll`,
        fonts.actionman.className
      )}>
        {assetUrl ? <SphericalImage
          assetUrl={assetUrl}
          debug={true}
        /> : null}
      </div>
      <div className={cn(
        `print:hidden`,
        `z-20 fixed inset-0`,
        `flex flex-row items-center justify-center`,
        `transition-all duration-300 ease-in-out`,
        isLoading
          ? `bg-zinc-100/10 backdrop-blur-md`
          : `bg-zinc-100/0 backdrop-blur-none pointer-events-none`,
        fonts.actionman.className
      )}>
        <div className={cn(
          `text-center text-2xl text-stone-200 w-[70%]`,
          isLoading ? ``: `scale-0 opacity-0`,
          `transition-all duration-300 ease-in-out`,
        )}>
          {isLoading ? 'Generating metaverse location in the latent space..' : ''}
        </div>
      </div>
    </>
  )
}


export default function GeneratePage() {
  return (
    <div className="">
      <Suspense><TopMenu /></Suspense>
      <Suspense><PageContent /></Suspense>
      <BottomBar />
    </div>
  )
}