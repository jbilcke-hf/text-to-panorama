import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

export function About() {
  const [isOpen, setOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span className="hidden md:inline">About this project</span>
          <span className="inline md:hidden">About</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>The Panoremix</DialogTitle>
          <DialogDescription className="w-full text-center text-lg font-bold text-stone-800">
            What is Panoremix?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-stone-800">
          <p className="">
            Panoremix is a free and open-source application made to generate panoramas.
         </p>
         <p>
         👉 The stable diffusion model used to generate the images is <a className="text-stone-600 underline" href="https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0" target="_blank">SDXL 1.0</a>.
        </p>
         <p>
         👉 The SDXL LoRA model used is <a className="text-stone-600 underline" href="https://replicate.com/lucataco/sdxl-panoramic" target="_blank">sdxl-panoramic</a>, a seamless variant of <a className="text-stone-600 underline" href="https://replicate.com/jbilcke/sdxl-panorama" target="_blank">sdxl-panorama</a>.
         </p>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => setOpen(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}