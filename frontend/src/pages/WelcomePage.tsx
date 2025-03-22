import { Toaster } from "../components/ui/sonner"
import { ONCampusLanding } from "../components/Landing/LandingComponent"

const backgroundStyle = `
  .bg-pattern {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 2;
  }

  .wave-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    z-index: 0;
    overflow: hidden;
  }

  .wave {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #4C1D95;
    mask-image: url("data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 1000 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q 250 0 500 50 T 1000 50 L 1000 100 L 0 100 Z' fill='%23000'/%3E%3C/svg%3E");
    mask-size: cover;
    mask-repeat: no-repeat;
  }

  .wave-2 {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(76, 29, 149, 0.5);
    mask-image: url("data:image/svg+xml,%3Csvg width='100%' height='100%' viewBox='0 0 1200 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60 Q 300 0 600 60 T 1200 60 L 1200 100 L 0 100 Z' fill='%23000'/%3E%3C/svg%3E");
    mask-size: cover;
    mask-repeat: no-repeat;
    animation: wave 15s linear infinite;
  }

  @keyframes wave {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(-25%);
    }
    100% {
      transform: translateX(0);
    }
  }

  @media (max-width: 640px) {
    .wave-container {
      height: 100px;
    }
  }
`

export default function WelcomePage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #4338CA 0%, #7E22CE 100%)",
      }}
    >
      <style >
        {backgroundStyle}
      </style>
      <div className="bg-pattern"></div>
      <div className="wave-container">
        <div className="wave"></div>
        <div className="wave-2"></div>
      </div>
      <div className="content w-full">
        <ONCampusLanding />
      </div>
      <Toaster />
    </main>
  )
}

