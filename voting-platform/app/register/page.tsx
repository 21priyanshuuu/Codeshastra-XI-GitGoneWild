"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ParticleBackground } from "@/components/particle-background"
import { CursorGlow } from "@/components/cursor-glow"
import { FacialRegistration } from "@/components/facial-registration"
import { WalletConnection } from "@/components/wallet-connection"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"
import { auth } from "@/lib/api"

export default function Register() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    wallet_address: "",
    facial_data: "",
  })

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  const validateForm = () => {
    let valid = true
    const newErrors = { username: "", password: "", confirmPassword: "" }

    if (!formData.username) {
      newErrors.username = "Username is required"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleWalletConnect = (address: string) => {
    setFormData((prev) => ({ ...prev, wallet_address: address }))
    if (address) {
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      })
    }
  }

  const handleFacialCapture = (facialData: string) => {
    setFormData((prev) => ({ ...prev, facial_data: facialData }))
    if (facialData) {
      toast({
        title: "Facial Data Captured",
        description: "Your facial data has been successfully captured.",
      })
    }
  }

  const nextStep = () => {
    if (step === 1 && !validateForm()) return
    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.wallet_address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
      })
      return
    }

    if (!formData.facial_data) {
      toast({
        title: "Facial Data Required",
        description: "Please complete facial registration to continue.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const data = await auth.register({
        username: formData.username,
        password: formData.password,
        wallet_address: formData.wallet_address,
        facial_data: formData.facial_data,
      })

      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      })

      // Store tokens
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col">
      <CursorGlow />
      <ParticleBackground />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border border-gray-800 bg-black/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Join our secure blockchain voting platform
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step > i
                            ? "bg-purple-600 text-white"
                            : step === i
                              ? "bg-purple-900 text-white border border-purple-500"
                              : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {step > i ? <CheckCircle className="w-6 h-6" /> : i}
                      </div>
                      <span className="text-sm mt-1 text-gray-400">
                        {i === 1 ? "Account" : i === 2 ? "Wallet" : "Face"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-0 h-0.5 bg-purple-600 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
                  <div className="h-0.5 bg-gray-800" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className="bg-gray-900 border-gray-800"
                        placeholder="Choose a username"
                      />
                      {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-gray-900 border-gray-800"
                        placeholder="Create a password"
                      />
                      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="bg-gray-900 border-gray-800"
                        placeholder="Confirm your password"
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>

                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Continue
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <WalletConnection onConnect={handleWalletConnect} />
                    <div className="flex justify-between mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="border-gray-700 text-gray-300"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={!formData.wallet_address}
                      >
                        Continue
                      </Button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <FacialRegistration onCapture={handleFacialCapture} />
                    <div className="flex justify-between mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="border-gray-700 text-gray-300"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={loading || !formData.facial_data}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Complete Registration"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

