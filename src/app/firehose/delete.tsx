import { startTransition, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Post } from "@/types"

import { deletePost } from "../engine/community"

export function Delete({ post, moderationKey = "", onDelete = () => {} }: { post?: Post, moderationKey?: string; onDelete: (post: Post) => void }) {
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    if (post?.postId && !isOpen) {
      setOpen(true)
    }
  }, [post?.postId])

  const handleDelete = () => {
    startTransition(() => {
      const fn = async () => {
        setOpen(false)
        if (!post) { return }
        const postId = post.postId
        await deletePost({ postId, moderationKey })
        onDelete(post)
      }
      fn()
    })
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Delete</DialogTitle>
        </DialogHeader>
        {post ?<div className="flex flex-col py-4 text-stone-800">
       
        <div className="w-full h-64">
          <img
              src={post.assetUrl}
              className={cn(
                `w-full h-64 rounded-xl overflow-hidden object-cover`,
                `border border-zinc-900/70`
                )}
            /> 
          </div>
          <div className="text-lg text-stone-800/80 word-break w-full py-6">{post.prompt}</div>
        </div> : null}
        <DialogFooter>
          <div  className="w-full flex flex-row space-x-6 items-center justify-center">
            <Button type="submit" className="text-xl bg-green-800 text-green-100 hover:bg-green-700 hover:text-green-50" onClick={() => setOpen(false)}>Keep</Button>
            <Button type="submit" className="text-xl bg-red-800 text-red-100 hover:bg-red-700 hover:text-red-50" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}