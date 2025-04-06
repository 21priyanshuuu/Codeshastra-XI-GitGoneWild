"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings, HelpCircle, Menu, X } from "lucide-react"

interface DashboardHeaderProps {
  userData: any
}

export function DashboardHeader({ userData }: DashboardHeaderProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    router.push("/login")
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="bg-black/60 border-b border-gray-800 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mr-2">
                <span className="text-white font-bold">SV</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                SecureVote
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/elections" className="text-gray-300 hover:text-white transition-colors">
              Elections
            </Link>
            <Link href="/results" className="text-gray-300 hover:text-white transition-colors">
              Results
            </Link>
            <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
              Help
            </Link>
          </nav>

          <div className="flex items-center">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-gray-700">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt={userData?.user?.username || "User"} />
                    <AvatarFallback className="bg-purple-900 text-white">
                      {userData?.user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{userData?.user?.username || "User"}</p>
                    <p className="text-xs text-gray-400">Voter ID: {userData?.voter_id || "N/A"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-800">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-800">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-gray-800">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-4">
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-gray-300">
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/80 backdrop-blur-md border-b border-gray-800"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/elections"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Elections
              </Link>
              <Link
                href="/results"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Results
              </Link>
              <Link
                href="/help"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Help
              </Link>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  )
}

