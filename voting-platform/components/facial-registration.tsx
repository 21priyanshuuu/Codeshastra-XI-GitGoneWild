"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, RefreshCw, CheckCircle } from "lucide-react"

interface FacialRegistrationProps {
  onCapture: (facialData: string) => void
}

export function FacialRegistration({ onCapture }: FacialRegistrationProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)

        // Convert to base64 without the data URL prefix
        const base64Data = imageData.split(",")[1]
        onCapture(base64Data)

        stopCamera()
      }
    }
  }, [onCapture, stopCamera])

  const retakeImage = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  // Start camera when component mounts
  useState(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  })

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white">Facial Registration</h3>
        <p className="text-sm text-gray-400">We'll use your facial data for secure authentication</p>
      </div>

      <div className="relative">
        <Card className="overflow-hidden bg-gray-900 border-gray-700">
          {!capturedImage ? (
            <div className="relative aspect-video">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-purple-500/50 m-4 pointer-events-none"></div>
            </div>
          ) : (
            <div className="relative aspect-video">
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Captured facial image"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            </div>
          )}
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center">
        {!capturedImage ? (
          <Button
            onClick={captureImage}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Camera className="mr-2 h-4 w-4" />
            Capture Image
          </Button>
        ) : (
          <Button variant="outline" onClick={retakeImage} className="border-gray-700 text-gray-300">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake Image
          </Button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center mt-2">
        Your facial data is securely hashed and stored. We never share your biometric data.
      </div>
    </div>
  )
}

