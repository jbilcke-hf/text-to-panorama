"use client"

import { create } from "zustand"

export const useStore = create<{
  prompt: string
  assetUrl: string
  isLoading: boolean
  setLoading: (isLoading: boolean) => void
  setAssetUrl: (assetUrl: string) => void
  setPrompt: (prompt: string) => void
}>((set, get) => ({
  prompt: "an outdoor japanese onsen in snowy mountains during the morning",
  assetUrl: "",
  isLoading: false,
  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },
  setAssetUrl: (assetUrl: string) => {
    set({
      assetUrl
    })
  },
  setPrompt: (prompt: string) => {
    set({
      prompt,
    })
  }
}))
