"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticleBackground } from "@/components/particle-background"
import { CursorGlow } from "@/components/cursor-glow"
import { DashboardHeader } from "@/components/dashboard-header"
import { ElectionsList } from "@/components/elections-list"
import { VotingHistory } from "@/components/voting-history"
import { DisputesList } from "@/components/disputes-list"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { auth, elections, voters } from "@/lib/api"

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [activeElections, setActiveElections] = useState([])
  const [votingHistory, setVotingHistory] = useState([])
  const [disputes, setDisputes] = useState([])

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return false
      }
      return true
    }

    const fetchDashboardData = async () => {
      if (!checkAuth()) return

      setLoading(true)

      try {
        // Fetch user data
        const userData = await voters.getProfile()
        setUserData(userData)

        // Fetch active elections
        const electionsData = await elections.getAll()
        setActiveElections(electionsData.filter((e: any) => e.is_active))

        // Fetch voting history
        const historyData = await voters.getVotingHistory()
        setVotingHistory(historyData)

        // Fetch disputes
        const disputesData = await voters.getDisputes()
        setDisputes(disputesData)
      } catch (error) {
        console.error("Dashboard data fetch error:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <CursorGlow />
      <ParticleBackground />

      <div className="relative z-10">
        <DashboardHeader userData={userData} />

        <main className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Tabs defaultValue="elections" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="elections">Active Elections</TabsTrigger>
                <TabsTrigger value="history">Voting History</TabsTrigger>
                <TabsTrigger value="disputes">Disputes</TabsTrigger>
              </TabsList>

              <TabsContent value="elections">
                <ElectionsList elections={activeElections} />
              </TabsContent>

              <TabsContent value="history">
                <VotingHistory history={votingHistory} />
              </TabsContent>

              <TabsContent value="disputes">
                <DisputesList disputes={disputes} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

