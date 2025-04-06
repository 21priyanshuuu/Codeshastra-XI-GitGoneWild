"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, FileText, LinkIcon } from "lucide-react"

interface ElectionDetailsProps {
  election: any
}

export function ElectionDetails({ election }: ElectionDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  const getVotingMethodDescription = (method: string) => {
    switch (method) {
      case "APPROVAL":
        return "Approval voting allows voters to select any number of candidates they approve of. The candidate with the most approvals wins."
      case "RANKED":
        return "Ranked choice voting allows voters to rank candidates in order of preference. If no candidate receives a majority, the candidate with the fewest votes is eliminated and their votes are redistributed."
      case "QUADRATIC":
        return "Quadratic voting gives voters a budget of credits that they can allocate among candidates. The cost of votes increases quadratically, so voting strongly for one option costs more than voting weakly for multiple options."
      default:
        return "Standard voting method where each voter selects one candidate."
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2"
      >
        <Card className="bg-gray-900/60 border-gray-800 h-full">
          <CardHeader>
            <CardTitle className="text-xl text-white">Election Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-line">{election.description}</p>

              <h3 className="text-lg font-semibold text-white mt-6 mb-2">Voting Method</h3>
              <p className="text-gray-300">{getVotingMethodDescription(election.voting_method)}</p>

              <h3 className="text-lg font-semibold text-white mt-6 mb-2">Candidates</h3>
              <ul className="space-y-2">
                {election.candidates.map((candidate: any, index: number) => (
                  <li key={index} className="text-gray-300">
                    <span className="font-medium">{candidate.name}</span>
                    {candidate.description && <p className="text-gray-400 text-sm mt-1">{candidate.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gray-900/60 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-white">Election Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Calendar className="w-5 h-5 text-purple-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-gray-300">{formatDate(election.start_time)}</p>
                </div>
              </li>

              <li className="flex items-start">
                <Calendar className="w-5 h-5 text-purple-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="text-gray-300">{formatDate(election.end_time)}</p>
                </div>
              </li>

              <li className="flex items-start">
                <Clock className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Start Time</p>
                  <p className="text-gray-300">{formatTime(election.start_time)}</p>
                </div>
              </li>

              <li className="flex items-start">
                <Clock className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">End Time</p>
                  <p className="text-gray-300">{formatTime(election.end_time)}</p>
                </div>
              </li>

              <li className="flex items-start">
                <Users className="w-5 h-5 text-cyan-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Candidates</p>
                  <p className="text-gray-300">{election.candidates.length} candidates</p>
                </div>
              </li>

              <li className="flex items-start">
                <FileText className="w-5 h-5 text-green-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Voting Method</p>
                  <p className="text-gray-300">
                    {election.voting_method === "APPROVAL"
                      ? "Approval Voting"
                      : election.voting_method === "RANKED"
                        ? "Ranked Choice"
                        : "Quadratic Voting"}
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">Blockchain Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <LinkIcon className="w-5 h-5 text-purple-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Contract Address</p>
                  <p className="text-xs bg-gray-800 p-2 rounded-md font-mono break-all mt-1">
                    {election.contract_address || "Not deployed yet"}
                  </p>
                  {election.contract_address && (
                    <a
                      href={`https://etherscan.io/address/${election.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block"
                    >
                      View on Etherscan
                    </a>
                  )}
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

