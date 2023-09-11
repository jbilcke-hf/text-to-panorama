"use client"

import { useEffect, useState, useTransition } from "react"

import { Post } from "@/types"
import { cn } from "@/lib/utils"
import { actionman } from "@/lib/fonts"


import { getLatestPosts } from "./engine/community"

export default function Landing() {
  const [_isPending, startTransition] = useTransition()
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    startTransition(async () => {
      const newPosts = await getLatestPosts()
      setPosts(newPosts)
    })
  }, [])

  return (
    <div className={cn(
      `light fixed w-full h-full flex flex-col items-center bg-slate-300 text-slate-800`,
      `pt-24`,
      actionman.className
      )}>
      <div className="w-full flex flex-col items-center">
        <h1 className="text-[100px] text-cyan-700">🌐 Panoremix</h1>
        <h2 className="text-3xl mb-12">Generate cool panoramas using AI!</h2>
        
        <h2 className="text-2xl">Latest locations synthesized:</h2>

        <div className="grid grid-col-2 sm:grid-col-3 md:grid-col-4 lg:grid-cols-5 gap-4">
          {posts.map(post => (
            <div key={post.postId} className="flex flex-col space-y-3">
              <div className="w-full h-24">
                <img
                  src={post.assetUrl}
                  className="w-full h-full rounded-xl overflow-hidden"
                />
              </div>
              <div className="text-base truncate w-full">{post.prompt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}