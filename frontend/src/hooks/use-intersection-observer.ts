"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface UseInViewOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  triggerOnce?: boolean
}

export function useInView({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  triggerOnce = false,
}: UseInViewOptions = {}): [React.RefObject<any>, boolean] {
  const ref = useRef<Element | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting
        setIsInView(inView)

        if (inView && triggerOnce && ref.current) {
          observer.unobserve(ref.current)
        }
      },
      { root, rootMargin, threshold },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [root, rootMargin, threshold, triggerOnce])

  return [ref, isInView]
}

