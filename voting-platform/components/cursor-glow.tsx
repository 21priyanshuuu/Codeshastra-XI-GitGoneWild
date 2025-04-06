"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener("mousemove", updateMousePosition)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [isVisible])

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-50 rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          x: mousePosition.x - 200,
          y: mousePosition.y - 200,
          opacity: isVisible ? 0.3 : 0,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        style={{ width: "400px", height: "400px" }}
      />
      <motion.div
        className="fixed pointer-events-none z-50 rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          x: mousePosition.x - 100,
          y: mousePosition.y - 100,
          opacity: isVisible ? 0.3 : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 400, delay: 0.05 }}
        style={{ width: "200px", height: "200px" }}
      />
    </>
  )
}

