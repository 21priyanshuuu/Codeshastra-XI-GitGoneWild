"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, CheckCircle, AlertCircle } from "lucide-react"
import { ethers } from "ethers"

interface WalletConnectionProps {
  onConnect: (address: string) => void
}

export function WalletConnection({ onConnect }: WalletConnectionProps) {
  const [address, setAddress] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)
    setError("")

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please create an account in MetaMask.")
      }

      const address = accounts[0]
      setAddress(address)
      onConnect(address)

      // Request signature to verify ownership
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const message = `Secure Voting Platform Authentication\nTimestamp: ${Date.now()}`
      await signer.signMessage(message)
    } catch (err) {
      console.error("Error connecting wallet:", err)
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
      setAddress("")
      onConnect("")
    } finally {
      setIsConnecting(false)
    }
  }

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAddress(accounts[0])
            onConnect(accounts[0])
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err)
        }
      }
    }

    checkConnection()
  }, [onConnect])

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white">Connect Your Wallet</h3>
        <p className="text-sm text-gray-400">Link your blockchain wallet for secure voting</p>
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="pt-6">
          {address ? (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Wallet Connected</h4>
              <p className="text-sm text-gray-400 mb-2">Address:</p>
              <p className="text-xs bg-gray-800 p-2 rounded-md font-mono break-all">{address}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">No Wallet Connected</h4>
              <p className="text-sm text-gray-400 mb-4">Connect your wallet to continue with registration</p>

              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 text-center mt-2">
        We use your wallet address for blockchain verification. We never access your funds.
      </div>
    </div>
  )
}

