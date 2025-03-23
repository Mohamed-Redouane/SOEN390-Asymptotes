import { useRef, useEffect } from "react"
import type { ReactNode } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  index: number
  className?: string
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  index, 
  className = "" 
}: FeatureCardProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      className={`group relative h-full ${className}`}
      initial="hidden"
      animate={controls}
      whileHover="hover"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            delay: Math.min(0.1 * index + 0.3, 1),
            duration: 0.4,
            ease: "easeOut"
          }
        },
        hover: {
          scale: 1.05,
          zIndex: 1,
          transition: { duration: 0.2, ease: "easeOut" }
        }
      }}
      role="article"
      aria-labelledby={`feature-title-${index}`}
    >

      <div 
        className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/0 via-blue-500/0 to-purple-500/0 rounded-xl opacity-0 
                   group-hover:from-indigo-500/70 group-hover:via-blue-500/70 group-hover:to-purple-500/70 group-hover:opacity-100 
                   blur-md transition-all duration-300"
        aria-hidden="true"
      />


      <div 
        className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col 
                   justify-center items-center border border-white/10 
                   group-hover:border-blue-400/70 group-hover:bg-white/10
                   transition-all duration-300 shadow-lg shadow-black/5 group-hover:shadow-blue-500/30"
      >
        <motion.div
          className="bg-blue-500/10 p-3 rounded-full mb-4 flex justify-center items-center 
                    group-hover:bg-blue-500/30 transition-colors duration-300"
          variants={{
            hidden: { scale: 0 },
            visible: { 
              scale: 1,
              transition: { 
                delay: Math.min(0.1 * index + 0.4, 1.1), 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
              }
            },
            hover: {
              scale: 1.1,
              transition: { duration: 0.2 }
            }
          }}
          aria-hidden="true"
        >
          <div className="text-blue-400 text-xl group-hover:text-blue-200 transition-colors duration-300">
            {icon}
          </div>
        </motion.div>
        
        <motion.h3
          id={`feature-title-${index}`}
          className="text-xl font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                delay: Math.min(0.1 * index + 0.5, 1.2), 
                duration: 0.5 
              }
            },
            hover: {
              y: -2,
              transition: { duration: 0.2 }
            }
          }}
        >
          {title}
        </motion.h3>
        
        <motion.p
          className="text-gray-300 group-hover:text-white transition-colors duration-300"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                delay: Math.min(0.1 * index + 0.6, 1.3), 
                duration: 0.5 
              }
            }
          }}
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  )
}