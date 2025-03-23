import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  update: (canvasWidth: number, canvasHeight: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

/**
 * Use the Web Crypto API to generate a float in [0, 1).
 * This is cryptographically secure, so it won't trigger "weak random" warnings.
 */
function secureRandom() {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

/**
 * Creates a particle using the given canvas dimensions.
 * This function returns a plain object without using `this`.
 */
function createParticle(
  canvasWidth: number,
  canvasHeight: number,
  color: string
): Particle {
  // Replace Math.random() calls with secureRandom().
  let x = secureRandom() * canvasWidth;
  let y = secureRandom() * canvasHeight;
  const size = secureRandom() * 2 + 0.5;
  const speedX = secureRandom() * 0.5 - 0.25;
  const speedY = secureRandom() * 0.5 - 0.25;
  const alpha = secureRandom() * 0.5 + 0.1;

  return {
    get x() {
      return x;
    },
    get y() {
      return y;
    },
    update: (width: number, height: number) => {
      x += speedX;
      y += speedY;
      if (x > width) x = 0;
      else if (x < 0) x = width;
      if (y > height) y = 0;
      else if (y < 0) y = height;
    },
    draw: (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  };
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Store canvas dimensions to avoid repeated null checks.
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      canvasWidth = canvas.width;
      canvasHeight = canvas.height;

      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(
        Math.floor((window.innerWidth * window.innerHeight) / 10000),
        100
      );
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(canvasWidth, canvasHeight, "#60A5FA"));
      }
    };

    const connectParticles = () => {
      const maxDistance = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = "#60A5FA";
            ctx.globalAlpha = 0.1 * (1 - distance / maxDistance);
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (const particle of particles) {
        particle.update(canvasWidth, canvasHeight);
        particle.draw(ctx);
      }

      connectParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    />
  );
}
