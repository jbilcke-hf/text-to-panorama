import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

export function About() {
  const [isOpen, setOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-stone-800 dark:text-stone-200">
          <span className="hidden md:inline">About this project</span>
          <span className="inline md:hidden">About</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Text-to-panorama</DialogTitle>
          <DialogDescription className="w-full text-center text-lg font-bold text-stone-800">
            What is this app?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-stone-800">
          <p className="">
            Text-to-panorama is a free and open-source application made to generate panoramas.
         </p>
         <p>
         👉 The model used is <a className="text-stone-600 underline" href="https://huggingface.co/jbilcke-hf/flux-dev-panorama-lora-2" target="_blank">Flux.1-[dev] Panorama LoRA (v2)</a>.
         </p>
         <p>
         👉 Text-to-panorama is for non-commercial use only (see the model for licensing details).
        </p>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => setOpen(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}