import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom" 

import { XIcon } from "../../icons/x-icon"
import { InstagramIcon } from "../../icons/instagram-icon"
import { FacebookIcon } from "../../icons/facebook-icon"
import { SocialIcon } from "../../icons/social-icon"
import { Button } from "../ui/button"
import { FeatureCard } from "./Feature-card"
import { NavigationIcon, CalendarIcon, BuildingIcon, CompassIcon, CoffeeIcon, X, ChevronDown } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useMediaQuery } from "../../hooks/use-media-query"
import { NavBar } from "./NavBar"
import Logo from "../../icons/logo"
import { ContactSection } from "./Contact"
import { AboutSection } from "./About"
import { ParticleBackground } from "./Particule-background"
import { GitHubIcon } from "../../icons/github-icon"

export function ONCampusLanding() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState("home")
    const isDesktop = useMediaQuery("(min-width: 768px)")
    const mainRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
      target: mainRef,
      offset: ["start start", "end end"],
    })
  
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])
    const navigate = useNavigate()
    // Close mobile menu when switching to desktop
    useEffect(() => {
      if (isDesktop) {
        setIsMenuOpen(false)
      }
    }, [isDesktop])
  
    // Update active section based on scroll position
    useEffect(() => {
      const handleScroll = () => {
        const sections = ["home", "features", "about", "contact"]
        const scrollPosition = window.scrollY + 100
  
        for (const section of sections) {
          const element = document.getElementById(section)
          if (element) {
            const offsetTop = element.offsetTop
            const offsetHeight = element.offsetHeight
  
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section)
              break
            }
          }
        }
      }
  
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }, [])
  
    const scrollToFeatures = () => {
      const featuresSection = document.getElementById("features")
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" })
      }
    }
  
    const features = [
      {
        icon: <NavigationIcon className="w-6 h-6" />,
        title: "Campus Explorer",
        description: "Interactive maps for SGW and Loyola campuses with detailed building information.",
      },
      {
        icon: <NavigationIcon className="w-6 h-6" />,
        title: "Smart Navigation",
        description: "Get outdoor and indoor directions across campuses, optimized for various transportation methods.",
      },
      {
        icon: <CalendarIcon className="w-6 h-6" />,
        title: "Class Locator",
        description: "Seamlessly connect to your schedule and find the quickest route to your next class.",
      },
      {
        icon: <BuildingIcon className="w-6 h-6" />,
        title: "Indoor Mapping",
        description: "Navigate inside buildings with ease, including accessibility routes and points of interest.",
      },
      {
        icon: <CompassIcon className="w-6 h-6" />,
        title: "Real-Time Positioning",
        description: "Always know your location on campus and find the nearest facilities.",
      },
      {
        icon: <CoffeeIcon className="w-6 h-6" />,
        title: "Campus Life",
        description: "Discover nearby restaurants, coffee shops, and other points of interest around campus.",
      },
    ]
  
    return (
      <div
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between min-h-screen"
        ref={mainRef}
      >
        <NavBar activeSection={activeSection} setIsMenuOpen={setIsMenuOpen} />
        <ParticleBackground />
  
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden fixed inset-0 bg-[#4C1D95]/95 backdrop-blur-md z-50 flex flex-col"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <Logo size="small" animated={false} />
                <button
                  className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-6 p-8 text-center flex-1 justify-center">
                <a
                  href="#home"
                  className="text-2xl text-white hover:text-[#60A5FA] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="text-2xl text-white hover:text-[#60A5FA] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="text-2xl text-white hover:text-[#60A5FA] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-2xl text-white hover:text-[#60A5FA] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
              </nav>
              <div className="p-8 flex justify-center">
              <Button
        size="lg"
        className="w-full bg-[#60A5FA] hover:bg-[#3B82F6] text-white font-medium rounded-full"
        onClick={() => {
            setIsMenuOpen(false)
            navigate("/register") // Add navigation here
        }}
    >
        Get Started
    </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
  
        <div
          id="home"
          className="flex-1 flex flex-col justify-center items-center text-center py-12 md:py-16 mt-16 md:mt-20 relative"
        >
          <motion.div className="flex flex-col items-center" style={{ opacity, scale }}>
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#60A5FA] to-[#818CF8] opacity-30 blur-xl"></div>
              <motion.h1
                className="font-black leading-tight relative"
                style={{
                  fontFamily: "'Clash Display', sans-serif",
                }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white">Your Campus.</div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/90 mt-1">Your Community.</div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/80 mt-1">Your Experience.</div>
              </motion.h1>
            </motion.div>
          </motion.div>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-[#60A5FA] to-[#818CF8] rounded-full my-6"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          <motion.p
            className="text-base sm:text-lg md:text-xl mb-8 text-gray-200 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Navigate, discover, and connect with your campus community like never before.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col items-center"
          >
            <Button
        size="lg"
        className="bg-[#60A5FA] text-white hover:bg-[#3B82F6] transition-all duration-300 transform hover:scale-105 px-8 py-2 text-lg font-medium rounded-full"
        onClick={() => navigate("/register")} // Add navigation here
    >
        Start Exploring
    </Button>
  
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                scrollToFeatures()
              }}
              className="mt-12 text-white/80 hover:text-white flex flex-col items-center transition-colors"
            >
               <span className="text-sm font-medium mb-2">Discover Features</span>
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                >
                    <ChevronDown className="w-5 h-5 group-hover:text-blue-300 transition-colors" />
                </motion.div>
            </a>
          </motion.div>
  
          <motion.div
            id="features"
            className="mt-24 md:mt-32 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </motion.div>
        </div>
  
        <AboutSection />
        <ContactSection />
  
        <motion.footer
  className="py-8 flex flex-col items-center relative z-10"
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 1 }}
>
  <div className="flex justify-center space-x-6 mb-4">
    <SocialIcon
      href="https://x.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="X (formerly Twitter)"
      icon={<XIcon className="w-6 h-6" />}
    />
    <SocialIcon
      href="https://instagram.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      icon={<InstagramIcon className="w-6 h-6" />}
    />
    <SocialIcon
      href="https://facebook.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
      icon={<FacebookIcon className="w-6 h-6" />}
    />
    <SocialIcon
      href="https://github.com/Mohamed-Redouane/SOEN390-Asymptotes"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      icon={<GitHubIcon className="w-6 h-6" />}
    />
  </div>
  <p className="text-gray-300 text-sm">© 2025 ONCampus. All rights reserved.</p>
</motion.footer>
      </div>
    )
  }
  
  