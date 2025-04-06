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
import { FacialVerification } from "@/components/facial-verification"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"
import { auth } from "@/lib/api"

export default function Login() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    voter_id: "",
    facial_data: "",
  })

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  })

  const validateForm = () => {
    let valid = true
    const newErrors = { username: "", password: "" }

    if (!formData.username) {
      newErrors.username = "Username is required"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
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

  const handleFacialVerification = (facialData: string) => {
    setFormData((prev) => ({ ...prev, facial_data: facialData }))
  }

  const nextStep = async () => {
    if (step === 1) {
      if (!validateForm()) return

      setLoading(true)

      try {
        // Clear any existing tokens
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")

        const data = await auth.login(formData.username, formData.password)

        // Store tokens
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)

        // Store voter ID for facial verification
        setFormData((prev) => ({ ...prev, voter_id: data.voter.voter_id }))

        // Move to facial verification
        setStep(2)
      } catch (error) {
        toast({
          title: "Login Failed",
          description: error instanceof Error ? error.message : "Invalid credentials",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      nextStep()
      return
    }

    if (!formData.facial_data) {
      toast({
        title: "Facial Verification Required",
        description: "Please complete facial verification to continue.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await auth.verifyFace(formData.voter_id, formData.facial_data)

      toast({
        title: "Login Successful",
        description: "You have been successfully authenticated.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Facial verification failed",
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
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-gray-400">Sign in to access your account</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <div className="flex justify-around items-center mb-2">
                  {[1, 2].map((i) => (
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
                        {i === 1 ? "Login" : "Verify"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-0 h-0.5 bg-purple-600 transition-all duration-300" style={{ width: `${(step - 1) * 100}%` }} />
                  <div className="h-0.5 bg-gray-800" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
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
                        placeholder="Enter your username"
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
                        placeholder="Enter your password"
                      />
                      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </>
                ) : (
                  <FacialVerification onCapture={handleFacialVerification} />
                )}
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-purple-400 hover:text-purple-300">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

