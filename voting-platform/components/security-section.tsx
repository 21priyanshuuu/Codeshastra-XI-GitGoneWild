"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, FileCheck } from "lucide-react"

export function SecuritySection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Security By Design
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform is built from the ground up with security and privacy as core principles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-20"></div>
            <div className="relative bg-gray-900 p-8 rounded-lg border border-gray-800">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                <Shield className="text-purple-400" /> How We Protect Your Vote
              </h3>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="mt-1 bg-purple-900/20 p-2 rounded-lg">
                    <Lock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Blockchain Immutability</h4>
                    <p className="text-gray-400">
                      Once recorded, your vote cannot be altered or deleted, ensuring the integrity of the election.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="mt-1 bg-blue-900/20 p-2 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Zero-Knowledge Proofs</h4>
                    <p className="text-gray-400">
                      Cryptographic proofs allow verification of your eligibility without revealing your identity or
                      vote choice.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="mt-1 bg-cyan-900/20 p-2 rounded-lg">
                    <FileCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Multi-Factor Authentication</h4>
                    <p className="text-gray-400">
                      Combination of facial recognition, wallet signatures, and traditional authentication methods.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative h-full flex items-center"
          >
            <div className="w-full h-[400px] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/20 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="w-64 h-64 rounded-full border-2 border-dashed border-purple-500/30"
                    />

                    <motion.div
                      animate={{
                        rotate: -360,
                      }}
                      transition={{
                        duration: 15,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-dashed border-blue-500/30"
                    />

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600/40 to-blue-600/40 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-600/80 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{
                        y: [0, 10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-600/80 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

