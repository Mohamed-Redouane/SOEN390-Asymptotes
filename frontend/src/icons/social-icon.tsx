"use client"

import type React from "react"
import { motion } from "framer-motion"

interface SocialIconProps {
  href: string
  "aria-label": string
  icon: React.ReactNode
  target?: string
  rel?: string
}

export function SocialIcon({ href, "aria-label": ariaLabel, icon, target, rel }: SocialIconProps) {
  return (
    <motion.a
      href={href}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
      className="text-gray-400 hover:text-white transition-all duration-300 ease-in-out bg-white/10 p-3 rounded-full hover:bg-[#60A5FA]/20"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
    </motion.a>
  )
}

