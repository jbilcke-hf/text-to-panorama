"use client"

import { useState, useTransition } from "react"

import { Post } from "@/types"

export default function Main() {
  const [_isPending, startTransition] = useTransition()
  const posts = useState<Post[]>([])

  return (
    <div>
      <h1>Panoremix</h1>
      <h2>Generate 360° panoramas from text!</h2>
      
      <h2>Explore latent locations discovered by the community</h2>

      
    </div>
  )
}