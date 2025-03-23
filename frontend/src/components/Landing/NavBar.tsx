import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import Logo from "../../icons/logo"
import { useNavigate } from "react-router-dom"
interface NavBarProps {
    activeSection: string
    setIsMenuOpen: (isOpen: boolean) => void
  }
  
  export function NavBar({ activeSection, setIsMenuOpen }: NavBarProps) {
    const [scrolled, setScrolled] = useState(false)
    const navigate = useNavigate()
    useEffect(() => {
      const handleScroll = () => {
        const isScrolled = window.scrollY > 20
        if (isScrolled !== scrolled) {
          setScrolled(isScrolled)
        }
      }
  
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }, [scrolled])
  
    const navLinks = [
      { href: "#home", label: "Home" },
      { href: "#features", label: "Features" },
      { href: "#about", label: "About" },
      { href: "#contact", label: "Contact" },
    ]
  
    return (
      <motion.header
        className={cn("fixed top-0 left-0 right-0 z-40 transition-all duration-300", scrolled ? "py-2" : "py-3")}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#4338CA]/80 to-[#7E22CE]/80 backdrop-blur-md shadow-lg"></div>
  

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20">
          <div className="absolute top-0 left-0 right-0 h-full">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#60A5FA] to-transparent opacity-50"></div>
          </div>
        </div>
  
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <Logo size={scrolled ? "small" : "medium"} animated={!scrolled} />
          </motion.div>
  
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={activeSection === link.href.substring(1)}
              />
            ))}
          </nav>
  
          <div className="flex items-center space-x-3">
          <Button
                    className="hidden md:flex bg-[#60A5FA] hover:bg-[#3B82F6] text-white font-medium px-6 py-2 rounded-full transition-all duration-300"
                    size={scrolled ? "sm" : "default"}
                    onClick={() => navigate("/register")} 
                >
                    Get Started
                </Button>
            <button
              className="md:hidden relative p-2 text-white"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#60A5FA]/30 to-[#818CF8]/30 rounded-md blur-sm opacity-70"></div>
              <div className="relative">
                <Menu className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </motion.header>
    )
  }
  
  interface NavLinkProps {
    href: string
    label: string
    isActive: boolean
  }
  
  function NavLink({ href, label, isActive }: NavLinkProps) {
    return (
      <motion.a
        href={href}
        className={cn(
          "relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
          isActive ? "text-white" : "text-gray-300 hover:text-white",
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {label}
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#60A5FA] to-[#818CF8] rounded-full"
            layoutId="activeSection"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            isActive ? "bg-white/10" : "bg-transparent hover:bg-white/5",
          )}
        />
      </motion.a>
    )
  }
  
  