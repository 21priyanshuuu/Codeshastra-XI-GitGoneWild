"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, TrendingUp, Award } from "lucide-react"

interface ElectionResultsProps {
  election: any
}

export function ElectionResults({ election }: ElectionResultsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError(null)

      try {
        // If election is active, fetch preliminary results
        // If election is ended, fetch final results
        const endpoint = election.is_active
          ? `http://localhost:8000/api/elections/${election.id}/preliminary_results/`
          : `http://localhost:8000/api/elections/${election.id}/get_results/`

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setResults(null)
            return
          }
          throw new Error("Failed to fetch results")
        }

        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Results fetch error:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [election.id, election.is_active])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mr-2" />
        <p className="text-gray-400">Loading results...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-red-400 mb-2">Error Loading Results</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-purple-700 text-purple-400"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-400 mb-2">
          {election.is_active ? "Results Not Available Yet" : "No Results Found"}
        </h3>
        <p className="text-gray-500">
          {election.is_active
            ? "Results will be available once the election ends."
            : "The results for this election have not been finalized yet."}
        </p>
      </div>
    )
  }

  // Find the winner(s)
  let winners: string[] = []
  if (results.vote_counts) {
    const maxVotes = Math.max(...(Object.values(results.vote_counts) as number[]))
    winners = Object.entries(results.vote_counts)
      .filter(([_, votes]) => votes === maxVotes)
      .map(([candidateId, _]) => {
        const candidate = election.candidates.find((c: any) => c.id === candidateId)
        return candidate ? candidate.name : candidateId
      })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-white">Election Results</CardTitle>
              <CardDescription>{election.is_active ? "Preliminary results" : "Final results"}</CardDescription>
            </div>
            <Badge
              className={
                election.is_active
                  ? "bg-yellow-900/30 text-yellow-400 border-yellow-800"
                  : "bg-green-900/30 text-green-400 border-green-800"
              }
            >
              {election.is_active ? "In Progress" : "Finalized"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {winners.length > 0 && (
            <div className="mb-6 p-4 bg-purple-900/20 border border-purple-800/50 rounded-md">
              <div className="flex items-start">
                <Award className="w-5 h-5 text-purple-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-purple-400">
                    {winners.length === 1 ? "Winner" : "Tied Winners"}
                  </h4>
                  <p className="text-base text-white mt-1">{winners.join(", ")}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300">Vote Distribution</h4>

            {election.candidates.map((candidate: any) => {
              const votes = results.vote_counts?.[candidate.id] || 0
              const percentage = results.total_votes ? Math.round((votes / results.total_votes) * 100) : 0

              const isWinner = winners.includes(candidate.name)

              return (
                <div key={candidate.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm text-white">{candidate.name}</span>
                      {isWinner && (
                        <Badge className="ml-2 bg-purple-900/30 text-purple-400 border-purple-800">Winner</Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {votes} votes ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-gray-800 h-2 rounded-full">
                    <div
                      className={`${
                        isWinner ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-gray-600"
                      } h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Votes:</span>
              <span className="text-white font-medium">{results.total_votes || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {election.is_active && (
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-blue-400">Preliminary Results</h4>
              <p className="text-xs text-blue-300/80">
                These results are preliminary and may change as more votes are cast. Final results will be available
                after the election ends on {new Date(election.end_time).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

