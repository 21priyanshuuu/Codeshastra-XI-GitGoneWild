"use client"

import { motion } from "framer-motion"
import { ShieldCheck, UserCheck, Vote, Eye, FileCheck, AlertTriangle } from "lucide-react"

const features = [
  {
    icon: <ShieldCheck className="w-10 h-10 text-purple-400" />,
    title: "Blockchain Security",
    description: "All votes are securely recorded on the blockchain, ensuring immutability and transparency.",
  },
  {
    icon: <UserCheck className="w-10 h-10 text-blue-400" />,
    title: "Facial Recognition",
    description: "Advanced biometric verification ensures only authorized voters can participate.",
  },
  {
    icon: <Eye className="w-10 h-10 text-cyan-400" />,
    title: "Zero-Knowledge Proofs",
    description: "Vote anonymously while still proving your eligibility without revealing your identity.",
  },
  {
    icon: <Vote className="w-10 h-10 text-purple-400" />,
    title: "Multiple Voting Methods",
    description: "Support for approval voting, ranked choice, and quadratic voting systems.",
  },
  {
    icon: <FileCheck className="w-10 h-10 text-blue-400" />,
    title: "Verifiable Results",
    description: "Anyone can verify the election results without compromising voter privacy.",
  },
  {
    icon: <AlertTriangle className="w-10 h-10 text-cyan-400" />,
    title: "Dispute Resolution",
    description: "Built-in mechanisms for raising and resolving election disputes.",
  },
]

export function FeatureSection() {
  return (
    <section className="py-20 bg-black/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Cutting-Edge Features
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform combines the latest in blockchain technology, cryptography, and biometrics to deliver the most
            secure and transparent voting experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-xl border border-gray-800 hover:border-purple-900/50 transition-all duration-300"
            >
              <div className="mb-4 p-3 rounded-lg bg-gray-800/50 w-fit">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

