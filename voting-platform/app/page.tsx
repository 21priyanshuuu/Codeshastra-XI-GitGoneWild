"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ParticleBackground } from "@/components/particle-background"
import { CursorGlow } from "@/components/cursor-glow"
import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { SecuritySection } from "@/components/security-section"
import { Footer } from "@/components/footer"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <CursorGlow />
      <ParticleBackground />

      <div className="relative z-10">
        <HeroSection />
        <FeatureSection />
        <SecuritySection />

        <section className="container mx-auto py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Ready to Experience Secure Voting?
            </h2>
            <p className="text-gray-300 mb-10">
              Join our platform and participate in the future of secure, transparent, and anonymous voting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
                >
                  Register Now
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-950/20 px-8 py-6 text-lg"
                >
                  Login
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </main>
  )
}

