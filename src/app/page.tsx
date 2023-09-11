"use server"

import Head from "next/head"

// import Landing from "./landing"
import Generate from "./generate/page"

import { TooltipProvider } from "@/components/ui/tooltip"

// https://nextjs.org/docs/pages/building-your-application/optimizing/fonts 

export default async function Page() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=0.86, maximum-scale=5.0, minimum-scale=0.86" />
      </Head>
      <main className={
        `light bg-zinc-50 text-stone-900
        `}>
        <TooltipProvider delayDuration={100}>
          <Generate />
        </TooltipProvider>
      </main>
    </>
  )
}