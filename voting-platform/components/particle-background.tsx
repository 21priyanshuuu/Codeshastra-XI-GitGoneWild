"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    // Create particles
    const createParticles = () => {
      const particleCount = Math.floor(window.innerWidth / 10)
      particles = []

      const colors =
        theme === "dark"
          ? ["rgba(147, 51, 234, 0.5)", "rgba(59, 130, 246, 0.5)", "rgba(139, 92, 246, 0.5)"]
          : ["rgba(147, 51, 234, 0.3)", "rgba(59, 130, 246, 0.3)", "rgba(139, 92, 246, 0.3)"]

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    // Update and draw particles
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0
        if (particle.x < 0) particle.x = canvas.width
        if (particle.y > canvas.height) particle.y = 0
        if (particle.y < 0) particle.y = canvas.height

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Connect particles
        connectParticles(particle, particles.slice(i))
      })

      animationFrameId = requestAnimationFrame(render)
    }

    // Draw lines between nearby particles
    const connectParticles = (particle: Particle, otherParticles: Particle[]) => {
      const maxDistance = 150

      otherParticles.forEach((other) => {
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance
          ctx.beginPath()
          ctx.strokeStyle = `rgba(147, 51, 234, ${opacity * 0.2})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        }
      })
    }

    createParticles()
    render()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />
}

