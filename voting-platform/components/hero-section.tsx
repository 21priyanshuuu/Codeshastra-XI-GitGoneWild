"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck, Lock, Eye, Fingerprint } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-block mb-4 px-4 py-1 rounded-full bg-purple-900/30 border border-purple-700/50"
            >
              <span className="text-purple-400 font-medium">Secure • Anonymous • Verifiable</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400"
            >
              Next Generation Blockchain Voting
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Experience the future of secure voting with zero-knowledge proofs, facial recognition, and blockchain
              technology.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-950/20"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full h-[400px] lg:h-[500px] bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-r from-purple-600/50 to-blue-600/50 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <Lock className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-16 h-16 rounded-full bg-purple-900/80 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-purple-300" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-16 h-16 rounded-full bg-blue-900/80 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-blue-300" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2"
              >
                <div className="w-16 h-16 rounded-full bg-cyan-900/80 flex items-center justify-center">
                  <Fingerprint className="w-8 h-8 text-cyan-300" />
                </div>
              </motion.div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

