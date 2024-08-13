"use server"

import { Client } from "@gradio/client"

export async function upscalePanorama({
  image,
  prompt
}: {
  image: string
  prompt: string
}): Promise<string> {
  const app = await Client.connect("jbilcke-hf/clarity-upscaler-api")

 // const dataUri = await fetch(`data:image/jpeg;base64,${base64Data}`)
  const dataUri = await fetch(image)

  const imageBlob = await dataUri.blob()

  const result = await app.predict("/predict", {
    "Secret Token": process.env.MICRO_SERVICE_SECRET_TOKEN || "",

    // convert the base64 image to blob
    "Image": imageBlob,

    Prompt: `360° HDRI panorama photo, ${prompt}`,

    "Negative Prompt": "blurry, cropped",

    "Scalue Factor": 2,
  
    "Dynamic": 6,

    "Creativity": 0.35,

    "Resemblance": 0.6,

    "tiling_width": 112,

    "tiling_height": 144,

   // epicrealism_naturalSinRC1VAE.safetensors [84d76a0328]', 'juggernaut_reborn.safetensors [338b85bc4f]', 'flat2DAnimerge_v45Sharp.safetensors'],
    "sd_model": "juggernaut_reborn.safetensors [338b85bc4f]",
    "scheduler": "DPM++ 3M SDE Karras",
  })
  /*

  inputs.append(gr.Slider(
      label="Num Inference Steps", info='''Number of denoising steps''', value=18,
      minimum=1, maximum=100, step=1,
  ))
  
  inputs.append(gr.Number(
      label="Seed", info='''Random seed. Leave blank to randomize the seed''', value=1337
  ))
  
  inputs.append(gr.Checkbox(
      label="Downscaling", info='''Downscale the image before upscaling. Can improve quality and speed for images with high resolution but lower quality''', value=False
  ))
  
  inputs.append(gr.Number(
      label="Downscaling Resolution", info='''Downscaling resolution''', value=768
  ))
  
  inputs.append(gr.Textbox(
      label="Lora Links", info='''Link to a lora file you want to use in your upscaling. Multiple links possible, seperated by comma'''
  ))
  
  inputs.append(gr.Textbox(
      label="Custom Sd Model", info='''Link to a custom safetensors checkpoint file you want to use in your upscaling. Will overwrite sd_model checkpoint.'''
  ))
  
  ])
  */
  console.log(`result:`, result)

  return ""
}