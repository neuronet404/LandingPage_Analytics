"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set the initial value
    setMatches(media.matches)
    
    // Define the callback for media query change
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // Add the listener
    media.addEventListener("change", listener)
    
    // Clean up
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])
  
  return matches
}