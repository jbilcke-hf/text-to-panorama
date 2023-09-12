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
      ``,
      actionman.className
      )}>
      <div className="w-full flex flex-col items-center overflow-y-scroll">
        <div className="flex flex-col space-y-2 pt-18 mb-6">
          <h1 className="text-4xl md:text-6xl lg:text-[70px] xl:text-[100px] text-cyan-700">🌐 Panoremix</h1>
          <h2 className="text-3xl mb-6">Generate cool panoramas using AI!</h2>
          <h2 className="text-2xl">Latest locations synthesized:</h2>
        </div>

        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 px-12">
          {posts.map(post => (
            <div
              key={post.postId}
              className="flex flex-col space-y-3 cursor-pointer"
              onClick={() => {
                // TODO
              }}
              >
              <div className="w-full h-24">
                <img
                  src={post.assetUrl}
                  className={cn(
                    `w-full h-24 rounded-xl overflow-hidden object-cover`,
                    `border border-zinc-900/70`
                    )}
                />
              </div>
              <div className="text-sm text-stone-800/80 truncate w-full">{post.prompt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}