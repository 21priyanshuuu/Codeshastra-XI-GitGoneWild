"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticleBackground } from "@/components/particle-background"
import { CursorGlow } from "@/components/cursor-glow"
import { DashboardHeader } from "@/components/dashboard-header"
import { ElectionDetails } from "@/components/election-details"
import { VotingBooth } from "@/components/voting-booth"
import { ElectionResults } from "@/components/election-results"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { auth, elections, voters } from "@/lib/api"

interface ElectionPageProps {
  params: {
    id: string
  }
}

export default function ElectionPage({ params }: ElectionPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [election, setElection] = useState<any>(null)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return false
      }
      return true
    }

    const fetchElectionData = async () => {
      if (!checkAuth()) return

      setLoading(true)

      try {
        // Fetch user data
        const userData = await voters.getProfile()
        setUserData(userData)

        // Fetch election details
        const electionData = await elections.getById(params.id)
        setElection(electionData)

        // Check if user has voted
        const votesData = await voters.getVotingHistory() as any[];
        setHasVoted(votesData.some((vote: any) => vote.election_id === params.id))
      } catch (error) {
        console.error("Election data fetch error:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load election data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchElectionData()
  }, [params.id, router, toast])

  const handleVoteSubmitted = () => {
    setHasVoted(true)
    toast({
      title: "Vote Submitted",
      description: "Your vote has been successfully recorded on the blockchain.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Loading election details...</p>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{election.title}</h1>
                <p className="text-gray-400 mt-1">Election ID: {election.id}</p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={
                    election.is_active
                      ? "bg-green-900/30 text-green-400 border-green-800"
                      : "bg-red-900/30 text-red-400 border-red-800"
                  }
                >
                  {election.is_active ? "Active" : "Ended"}
                </Badge>

                <Badge
                  className={
                    election.voting_method === "APPROVAL"
                      ? "bg-green-900/30 text-green-400 border-green-800"
                      : election.voting_method === "RANKED"
                        ? "bg-blue-900/30 text-blue-400 border-blue-800"
                        : "bg-purple-900/30 text-purple-400 border-purple-800"
                  }
                >
                  {election.voting_method === "APPROVAL"
                    ? "Approval Voting"
                    : election.voting_method === "RANKED"
                      ? "Ranked Choice"
                      : "Quadratic Voting"}
                </Badge>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue={hasVoted ? "results" : "vote"} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="vote" disabled={hasVoted || !election.is_active}>
                {hasVoted ? "Already Voted" : "Vote"}
              </TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <ElectionDetails election={election} />
            </TabsContent>

            <TabsContent value="vote">
              <VotingBooth election={election} voter={userData} onVoteSubmitted={handleVoteSubmitted} />
            </TabsContent>

            <TabsContent value="results">
              <ElectionResults election={election} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

