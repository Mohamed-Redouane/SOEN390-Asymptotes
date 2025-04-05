import type React from "react"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

const ModalPOI: React.FC<ModalProps> = ({ isOpen, onClose, children, title = "Points of Interest" }) => {
  const modalRef = useRef<HTMLDialogElement>(null)
  
  useEffect(() => {
    // Handle escape key press to close the modal
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    
    // Handle keydown to close the modal
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])
  

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <button
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        id="poimodal-overlay"
        aria-label="Close modal"
      />
      
      <dialog
        ref={modalRef}
        open={isOpen}
        className="relative z-50 w-80 max-w-[90vw] rounded-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
        }}
        tabIndex={0}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/20">
          <h3 id="modal-title" className="text-lg font-medium text-[#5A2DA2]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} className="text-[#5A2DA2]" />
          </button>
        </header>
        
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto [&_label]:font-medium [&_label]:text-[#5A2DA2] [&_label]:block [&_label]:mb-1">
          {children}
        </div>
        
        <footer
          className="p-4 border-t border-white/20"
          style={{
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(224, 217, 255, 0.3))",
          }}
        >
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-[#5A2DA2] hover:bg-[#4b29f1] text-white font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </footer>
      </dialog>
    </div>
  )
}

export default ModalPOI