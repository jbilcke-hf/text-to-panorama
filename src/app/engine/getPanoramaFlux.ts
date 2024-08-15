"use server"

import { HfInference, HfInferenceEndpoint } from '@huggingface/inference'

import { filterOutBadWords } from "./censorship"

export async function getPanoramaFlux({
  prompt,
  width,
  height,
}: {
  prompt: string
  width: number
  height: number
}): Promise<string> {
  if (!prompt) {
    console.error(`cannot call the rendering API without a prompt, aborting..`)
    throw new Error(`cannot call the rendering API without a prompt, aborting..`)
  }

  prompt = [
    `HDRI panoramic view of TOK`,
    filterOutBadWords(prompt),
    `highly detailed`,
    `intricate details`,
  ].join(', ')


  console.log(`calling API with prompt: ${prompt}`)
    
  const hf: HfInferenceEndpoint = new HfInference(
    `${process.env.HF_API_KEY}`
  )
    
  const blob: Blob = await hf.textToImage({
    model: "jbilcke-hf/flux-dev-panorama-lora-2",
    inputs: prompt,
    parameters: {
      width,
      height,
      // this triggers the following exception:
      // Error: __call__() got an unexpected keyword argument 'negative_prompt'
      // negative_prompt: request.prompts.image.negative || '',
  
      /**
       * The number of denoising steps. More denoising steps usually lead to a higher quality image at the expense of slower inference.
       */
      // num_inference_steps?: number;
      /**
       * Guidance scale: Higher guidance scale encourages to generate images that are closely linked to the text `prompt`, usually at the expense of lower image quality.
       */
      // guidance_scale?: number;
    },
  })
  
  // console.log('output from Hugging Face Inference API:', blob)
  
  const buffer = Buffer.from(await blob.arrayBuffer())
  
  return `data:${blob.type || 'image/jpeg'};base64,${buffer.toString('base64')}`
}
