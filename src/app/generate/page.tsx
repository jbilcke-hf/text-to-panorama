"use client"

import { useEffect, useRef, useTransition } from "react"

import { cn } from "@/lib/utils"
import { TopMenu } from "../interface/top-menu"
import { fonts } from "@/lib/fonts"

import { useStore } from "../store"
import { BottomBar } from "../interface/bottom-bar"
import { SphericalImage } from "../interface/spherical-image"
import { getRender, newRender } from "../engine/render"
import { RenderedScene } from "@/types"
import { getPost, postToCommunity } from "../engine/community"
import { useSearchParams } from "next/navigation"

export default function GeneratePage() {
  const searchParams = useSearchParams()
  const [_isPending, startTransition] = useTransition()
  const postId = (searchParams.get("postId") as string) || ""

  const prompt = useStore(state => state.prompt)
  const setPrompt = useStore(state => state.setPrompt)
  const setRendered = useStore(state => state.setRendered)
  const renderedScene = useStore(state => state.renderedScene)
  const isLoading = useStore(state => state.isLoading)
  const setLoading = useStore(state => state.setLoading)

  // keep a ref in sync
  const renderedRef = useRef<RenderedScene>()
  const renderedKey = JSON.stringify(renderedScene)
  useEffect(() => { renderedRef.current = renderedScene }, [renderedKey])
  
  const timeoutRef = useRef<any>(null)
  
  const delay = 3000

  // react to prompt changes
  useEffect(() => {
    if (!prompt) { return }

    // to prevent loading a new prompt if we are already loading
    // (eg. the initial one, from a community post)
    // if (isLoading) { return }

    startTransition(async () => {
 
      try {
        const rendered = await newRender({ prompt, clearCache: true })
        setRendered(rendered)
      } catch (err) {
        console.error(err)
      } finally {
      }
    })
  }, [prompt]) // important: we need to react to preset changes too


  const checkStatus = () => {
    startTransition(async () => {
      clearTimeout(timeoutRef.current)

      if (renderedRef.current?.status === "completed") {
        console.log("rendering job is already completed")
        return
      }

      if (!renderedRef.current?.renderId || renderedRef.current?.status !== "pending") {
        timeoutRef.current = setTimeout(checkStatus, delay)
        return
      }

      try {
        // console.log(`Checking job status API for job ${renderedRef.current?.renderId}`)
        const newRendered = await getRender(renderedRef.current.renderId)
        if (!newRendered) {
          throw new Error(`getRender failed`)
        }
        // console.log("got a response!", newRendered)

        if (JSON.stringify(renderedRef.current) !== JSON.stringify(newRendered)) {
          // console.log("updated panel:", newRendered)
          setRendered(renderedRef.current = newRendered)
        }
        // console.log("status:", newRendered.status)

        if (newRendered.status === "pending") {
          console.log("job not finished")
          timeoutRef.current = setTimeout(checkStatus, delay)
        } else if (newRendered.status === "error" || 
        (newRendered.status === "completed" && !newRendered.assetUrl?.length)) {
          console.log(`panorama got an error and/or an empty asset url :/ "${newRendered.error}", but let's try to recover..`)
          setLoading(false)
        } else {
          console.log("panorama finished:", newRendered)
          try {
            await postToCommunity({
              prompt,
              model: "jbilcke-hf/sdxl-panorama",
              assetUrl: newRendered.assetUrl,
            })
          } catch (err) {
            console.log("failed to post to community, but it's no big deal")
          }
          setRendered(newRendered)
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        timeoutRef.current = setTimeout(checkStatus, delay)
      }
    })
  }
 
  useEffect(() => {
    // console.log("starting timeout")
    clearTimeout(timeoutRef.current)
    
    // normally it should reply in < 1sec, but we could also use an interval
    timeoutRef.current = setTimeout(checkStatus, delay)

    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [prompt])

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

        setRendered({
          renderId: postId,
          status: "completed",
          assetUrl: post.assetUrl, 
          alt: post.prompt,
          error: "",
          maskUrl: "",
          segments: []
        })
        setLoading(false)
      } catch (err) {
        console.error("failed to get post: ", err)
        setLoading(false)
      }
    })
  }, [postId])

  return (
    <div className="">
      <TopMenu />
      <div className={cn(
        `fixed inset-0 w-screen h-screen overflow-y-scroll`,
        fonts.actionman.className
      )}>
        {renderedScene.assetUrl ? <SphericalImage
          rendered={renderedScene}
          onEvent={(() => {}) as any}
          debug={true}
        /> : null}
      </div>
      <BottomBar />
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
    </div>
  )
}