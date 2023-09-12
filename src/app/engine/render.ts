"use server"

import Replicate, { Prediction } from "replicate"

import { RenderRequest, RenderedScene, RenderingEngine } from "@/types"
import { generateSeed } from "@/lib/generateSeed"
import { sleep } from "@/lib/sleep"
import { filterOutBadWords } from "./censorship"

const renderingEngine = `${process.env.RENDERING_ENGINE || ""}` as RenderingEngine

const replicateToken = `${process.env.REPLICATE_API_TOKEN || ""}`
const replicateModel = `${process.env.REPLICATE_API_MODEL || ""}`
const replicateModelVersion = `${process.env.REPLICATE_API_MODEL_VERSION || ""}`

// note: there is no / at the end in the variable
// so we have to add it ourselves if needed
const apiUrl = process.env.VIDEOCHAIN_API_URL

export async function newRender({
  prompt,
  clearCache,
}: {
  prompt: string
  clearCache: boolean
}) {
  if (!prompt) {
    console.error(`cannot call the rendering API without a prompt, aborting..`)
    throw new Error(`cannot call the rendering API without a prompt, aborting..`)
  }

  prompt = [
    `hdri view`,
    `highly detailed`,
    `intricate details`,
    filterOutBadWords(prompt)
  ].join(', ')
 
  // return await Gorgon.get(cacheKey, async () => {

  let defaulResult: RenderedScene = {
    renderId: "",
    status: "error",
    assetUrl: "",
    alt: prompt || "",
    maskUrl: "",
    error: "failed to fetch the data",
    segments: []
   }

  try {
    console.log(`calling POST ${apiUrl}/render with prompt: ${prompt}`)

    const request = {
      prompt,
      nbFrames: 1, // when nbFrames is 1, we will only generate static images
      nbSteps: 35, // 20 = fast, 30 = better, 50 = best
      actionnables: [],
      segmentation: "disabled", // one day we will remove this param, to make it automatic
      width: 1024,
      height: 768,

      // on VideoQuest we use an aggressive setting: 4X upscaling
      // this generates images that can be slow to load, but that's
      // not too much of an issue since we use async loading
      upscalingFactor: 1,

      // note that we never disable the cache completely for VideoQuest
      // that's because in the feedbacks people prefer speed to avoid frustration
      cache: clearCache ? "renew" : "use",

    } as Partial<RenderRequest>

    console.table(request)

    if (renderingEngine === "REPLICATE") {
      if (!replicateToken) {
        throw new Error(`you need to configure your REPLICATE_API_TOKEN in order to use the REPLICATE rendering engine`)
      }
      if (!replicateModel) {
        throw new Error(`you need to configure your REPLICATE_API_MODEL in order to use the REPLICATE rendering engine`)
      }
      if (!replicateModelVersion) {
        throw new Error(`you need to configure your REPLICATE_API_MODEL_VERSION in order to use the REPLICATE rendering engine`)
      }
      const replicate = new Replicate({ auth: replicateToken })

      // console.log("Calling replicate..")
      const seed = generateSeed()
      const prediction = await replicate.predictions.create({
        version: replicateModelVersion,
        input: { prompt, seed }
      })
      
      // console.log("prediction:", prediction)

      // no need to reply straight away: good things take time
      // also our friends at Replicate won't like it if we spam them with requests
      await sleep(12000)

      return {
        renderId: prediction.id,
        status: "pending",
        assetUrl: "", 
        alt: prompt,
        error: prediction.error,
        maskUrl: "",
        segments: []
      } as RenderedScene
    } else {

      const res = await fetch(`${apiUrl}/render`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          // Authorization: `Bearer ${process.env.VC_SECRET_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(request),
        cache: 'no-store',
      // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
      // next: { revalidate: 1 }
      })

      // console.log("res:", res)
      // The return value is *not* serialized
      // You can return Date, Map, Set, etc.
      
      // Recommendation: handle errors
      if (res.status !== 200) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
      }
      
      const response = (await res.json()) as RenderedScene
      // console.log("response:", response)
      return response
    }
  } catch (err) {
    console.log("request failed:", err)
    console.error(err)
    // Gorgon.clear(cacheKey)
    return defaulResult
  }

  // }, cacheDurationInSec * 1000)
}

export async function getRender(renderId: string) {
  if (!renderId) {
    console.error(`cannot call the rendering API without a renderId, aborting..`)
    throw new Error(`cannot call the rendering API without a renderId, aborting..`)
  }

  let defaulResult: RenderedScene = {
    renderId: "",
    status: "pending",
    assetUrl: "",
    alt: "",
    maskUrl: "",
    error: "",
    segments: []
  }

  try {


    if (renderingEngine === "REPLICATE") {
      if (!replicateToken) {
        throw new Error(`you need to configure your REPLICATE_API_TOKEN in order to use the REPLICATE rendering engine`)
      }
      if (!replicateModel) {
        throw new Error(`you need to configure your REPLICATE_API_MODEL in order to use the REPLICATE rendering engine`)
      }

      // const replicate = new Replicate({ auth: replicateToken })

      // console.log("Calling replicate..")
      // const prediction = await replicate.predictions.get(renderId)
      // console.log("Prediction:", prediction)

       // console.log(`calling GET https://api.replicate.com/v1/predictions/${renderId}`)
       const res = await fetch(`https://api.replicate.com/v1/predictions/${renderId}`, {
        method: "GET",
        headers: {
          // Accept: "application/json",
          // "Content-Type": "application/json",
          Authorization: `Token ${replicateToken}`,
        },
        cache: 'no-store',
      // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
      // next: { revalidate: 1 }
      })
    
      // console.log("res:", res)
      // The return value is *not* serialized
      // You can return Date, Map, Set, etc.
      
      // Recommendation: handle errors
      if (res.status !== 200) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
      }
      
      const response = (await res.json()) as any
      // console.log("response:", response)

      return  {
        renderId,
        status: response?.error ? "error" : response?.status === "succeeded" ?  "completed" : "pending",
        assetUrl: `${response?.output || ""}`,
        alt: `${response?.input?.prompt || ""}`,
        error: `${response?.error || ""}`,
        maskUrl: "",
        segments: []
      } as RenderedScene
    } else {

      // console.log(`calling GET ${apiUrl}/render with renderId: ${renderId}`)
      const res = await fetch(`${apiUrl}/render/${renderId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VC_SECRET_ACCESS_TOKEN}`,
        },
        cache: 'no-store',
      // we can also use this (see https://vercel.com/blog/vercel-cache-api-nextjs-cache)
      // next: { revalidate: 1 }
      })

      // console.log("res:", res)
      // The return value is *not* serialized
      // You can return Date, Map, Set, etc.
      
      // Recommendation: handle errors
      if (res.status !== 200) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
      }
      
      const response = (await res.json()) as RenderedScene
      // console.log("response:", response)

      return response
    }
  } catch (err) {
    console.error(err)
    defaulResult.status = "error"
    defaulResult.error = `${err}`
    // Gorgon.clear(cacheKey)
    return defaulResult
  }

  // }, cacheDurationInSec * 1000)
}