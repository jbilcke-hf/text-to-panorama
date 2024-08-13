"use server"

import { Client } from "@gradio/client"

export async function getPanoramaSDXL({
  prompt
}: {
  prompt: string
}): Promise<string> {
  const app = await Client.connect("jbilcke-hf/panorama-api")

  const result = await app.predict("/predict", [
    process.env.MICRO_SERVICE_SECRET_TOKEN || "",
    prompt,
    undefined
  ])
  console.log(`result:`, result)

  return ""
}