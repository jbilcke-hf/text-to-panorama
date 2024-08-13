"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useStore } from "@/app/store"
import { Button } from "@/components/ui/button"
export function TopMenu() {
  const prompt = useStore(s => s.prompt)

  const setPrompt = useStore(s => s.setPrompt)
  const setAssetUrl = useStore(s => s.setAssetUrl)

  const isLoading = useStore(s => s.isLoading)
  const setLoading = useStore(s => s.setLoading)

  const searchParams = useSearchParams()

  const requestedPrompt = (searchParams.get('prompt') as string) || ""

  const [draftPrompt, setDraftPrompt] = useState(requestedPrompt)

  const handleSubmit = () => {
    const promptChanged = draftPrompt.trim() !== prompt.trim()
    if (!isLoading && (promptChanged)) {
      // important: we reset!
      setAssetUrl("")
      setPrompt(draftPrompt)
    }
  }

  return (
    <div className={cn(
      `print:hidden`,
      `z-10 fixed top-0 left-0 right-0`,
      `flex flex-col md:flex-row w-full justify-between items-center`,
      `backdrop-blur-xl`,
      `transition-all duration-200 ease-in-out`,
      `px-2 py-2 border-b-1 border-gray-50 dark:border-gray-50`,
      `bg-stone-900/70 dark:bg-stone-900/70 text-gray-50 dark:text-gray-50`,
      `space-y-2 md:space-y-0 md:space-x-3 lg:space-x-6`
    )}>
      <div className={cn(
          `transition-all duration-200 ease-in-out`,
          `flex  flex-grow flex-col space-y-2 md:space-y-0 md:flex-row items-center md:space-x-3 font-mono w-full md:w-auto`
        )}>
          <div className="flex flex-row flex-grow w-full">
        <Input
          placeholder={`Invent a location e.g. Jurassic Park entrance, Spaceport in Mos Eisley..`}
          className="w-full bg-neutral-300 text-neutral-800 dark:bg-neutral-300 dark:text-neutral-800 rounded-r-none"
          // disabled={atLeastOnePanelIsBusy}
          onChange={(e) => {
            setDraftPrompt(e.target.value)
          }}
          onKeyDown={({ key }) => {
            if (key === 'Enter') {
             if (!isLoading) {
                setLoading(true)
                handleSubmit()
             }
            }
          }}
          value={draftPrompt}
         />
        <Button
          className={cn(
            `rounded-l-none cursor-pointer`,
            `transition-all duration-200 ease-in-out`,
            `bg-[rgb(59,134,247)] hover:bg-[rgb(69,144,255)] disabled:bg-[rgb(59,134,247)]`,
            )}
          onClick={() => {
            if (!isLoading) {
              setLoading(true)
              handleSubmit()
            }
          }}
          disabled={!draftPrompt?.trim().length || isLoading}
        >
          {isLoading ? 'Loading..' : 'Travel'}
        </Button>
        </div>
      </div>
    </div>
  )
}