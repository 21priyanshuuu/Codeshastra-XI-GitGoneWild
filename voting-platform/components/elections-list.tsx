"use client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, ChevronRight } from "lucide-react"

interface Election {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  voting_method: string
  candidates: any[]
  is_active: boolean
}

interface ElectionsListProps {
  elections: Election[]
}

export function ElectionsList({ elections }: ElectionsListProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getVotingMethodLabel = (method: string) => {
    switch (method) {
      case "APPROVAL":
        return "Approval Voting"
      case "RANKED":
        return "Ranked Choice"
      case "QUADRATIC":
        return "Quadratic Voting"
      default:
        return method
    }
  }

  const getVotingMethodColor = (method: string) => {
    switch (method) {
      case "APPROVAL":
        return "bg-green-900/30 text-green-400 border-green-800"
      case "RANKED":
        return "bg-blue-900/30 text-blue-400 border-blue-800"
      case "QUADRATIC":
        return "bg-purple-900/30 text-purple-400 border-purple-800"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-800"
    }
  }

  const handleElectionClick = (id: number) => {
    router.push(`/elections/${id}`)
  }

  if (elections.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-400 mb-4">No Active Elections</h3>
        <p className="text-gray-500 mb-6">There are currently no active elections available for voting.</p>
        <Button variant="outline" className="border-purple-700 text-purple-400">
          View Past Elections
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {elections.map((election, index) => (
        <motion.div
          key={election.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card
            className="bg-gray-900/60 border-gray-800 hover:border-purple-800/50 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => handleElectionClick(election.id)}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 to-blue-600" />

            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-white">{election.title}</CardTitle>
                  <CardDescription className="text-gray-400 mt-1">
                    {election.description.length > 100
                      ? `${election.description.substring(0, 100)}...`
                      : election.description}
                  </CardDescription>
                </div>
                <Badge className={`${getVotingMethodColor(election.voting_method)}`}>
                  {getVotingMethodLabel(election.voting_method)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="text-sm text-gray-300">{formatDate(election.start_time)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="text-sm text-gray-300">{formatDate(election.end_time)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Start Time</p>
                    <p className="text-sm text-gray-300">{formatTime(election.start_time)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-400 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">End Time</p>
                    <p className="text-sm text-gray-300">{formatTime(election.end_time)}</p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-400">{election.candidates.length} Candidates</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 -mr-2"
              >
                Vote Now <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

