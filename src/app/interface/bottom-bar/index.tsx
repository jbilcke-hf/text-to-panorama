import { useStore } from "@/app/store"
import { cn } from "@/lib/utils"

import { About } from "../about"

export function BottomBar() {
  // const prompt = useStore(state => state.prompt)
  // const renderedScene = useStore(state => state.renderedScene)
  // const setRendered = useStore(state => state.setRendered)

  const isLoading = false

  return (
    <div className={cn(
      `print:hidden`,
      `fixed bottom-0 md:bottom-0 left-2 right-0 md:left-3 md:right-1`,
      `flex flex-row`,
      `justify-between`
    )}>
      <div className={cn(
        `flex flex-row`,
        `items-end`,
        `animation-all duration-300 ease-in-out`,
        isLoading ? `scale-0 opacity-0` : ``,
        `space-x-3`,
        `scale-[0.9]`
      )}>
        {/*<About />*/}
      </div>
      <div className={cn(
      `flex flex-row`,
      `animation-all duration-300 ease-in-out`,
      isLoading ? `scale-0 opacity-0` : ``,
      `space-x-3`,
      `scale-[0.9]`
    )}>
      {/*
        <div>
          <Button
            onClick={handleShare}
            disabled={!prompt?.length}
            className="space-x-2"
          >
            <div className="scale-105"><HuggingClap /></div>
            <div>
              <span className="hidden md:inline">Share to community</span>
              <span className="inline md:hidden">Share</span>
            </div>
          </Button>
        </div>
      */}
        <About />
      </div>
    </div>
  )
}