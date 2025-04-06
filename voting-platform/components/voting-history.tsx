"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ExternalLink } from "lucide-react"

interface Vote {
  id: number
  election: {
    id: number
    title: string
  }
  transaction_hash: string
  is_verified: boolean
  created_at: string
}

interface VotingHistoryProps {
  history: Vote[]
}

export function VotingHistory({ history }: VotingHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-400 mb-4">No Voting History</h3>
        <p className="text-gray-500 mb-6">You haven't participated in any elections yet.</p>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          Browse Elections
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {history.map((vote, index) => (
        <motion.div
          key={vote.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-white">{vote.election.title}</CardTitle>
                  <CardDescription className="text-gray-400">Vote ID: {vote.id}</CardDescription>
                </div>
                <Badge
                  className={
                    vote.is_verified
                      ? "bg-green-900/30 text-green-400 border-green-800"
                      : "bg-yellow-900/30 text-yellow-400 border-yellow-800"
                  }
                >
                  {vote.is_verified ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center mb-2">
                <span className="text-xs text-gray-500 w-24">Transaction:</span>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded font-mono text-gray-300">
                  {truncateHash(vote.transaction_hash)}
                </span>
                <a
                  href={`https://etherscan.io/tx/${vote.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center">
                <span className="text-xs text-gray-500 w-24">Timestamp:</span>
                <span className="text-xs text-gray-300">{formatDate(vote.created_at)}</span>
              </div>
            </CardContent>

            <CardFooter className="border-t border-gray-800 pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 text-xs"
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

