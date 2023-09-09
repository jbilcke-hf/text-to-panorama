"use client"

import { create } from "zustand"

import { RenderedScene } from "@/types"

export const useStore = create<{
  prompt: string
  renderedScene: RenderedScene
  isLoading: boolean
  setLoading: (isLoading: boolean) => void
  setRendered: (renderedScene: RenderedScene) => void
  generate: (prompt: string) => void
}>((set, get) => ({
  prompt: "",
  renderedScene: {
    renderId: "",
    status: "pending",
    assetUrl: "",
    alt: "",
    error: "",
    maskUrl: "",
    segments: []
  },
  isLoading: false,
  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },
  setRendered: (renderedScene: RenderedScene) => {
    set({
      renderedScene
    })
  },
  generate: (prompt: string) => {
    set({
      prompt,
    })
  }
}))
