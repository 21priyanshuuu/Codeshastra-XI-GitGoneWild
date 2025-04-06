"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react"

interface Dispute {
  id: number
  election: {
    id: number
    title: string
  }
  description: string
  status: string
  created_at: string
  resolved_at: string | null
  resolution: string | null
}

interface DisputesListProps {
  disputes: Dispute[]
}

export function DisputesList({ disputes }: DisputesListProps) {
  const [expandedDispute, setExpandedDispute] = useState<number | null>(null)

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "RESOLVED":
        return (
          <Badge className="bg-green-900/30 text-green-400 border-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Resolved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-900/30 text-red-400 border-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return <Badge className="bg-gray-900/30 text-gray-400 border-gray-800">{status}</Badge>
    }
  }

  const toggleExpand = (id: number) => {
    if (expandedDispute === id) {
      setExpandedDispute(null)
    } else {
      setExpandedDispute(id)
    }
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-400 mb-4">No Disputes</h3>
        <p className="text-gray-500 mb-6">You haven't raised any disputes for elections.</p>
        <Button variant="outline" className="border-purple-700 text-purple-400">
          View Elections
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {disputes.map((dispute, index) => (
        <motion.div
          key={dispute.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-white">Dispute for: {dispute.election.title}</CardTitle>
                  <CardDescription className="text-gray-400">Dispute ID: {dispute.id}</CardDescription>
                </div>
                {getStatusBadge(dispute.status)}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-start mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  {expandedDispute === dispute.id
                    ? dispute.description
                    : dispute.description.length > 100
                      ? `${dispute.description.substring(0, 100)}...`
                      : dispute.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <span className="text-gray-300 ml-2">{formatDate(dispute.created_at)}</span>
                </div>

                {dispute.resolved_at && (
                  <div>
                    <span className="text-gray-500">Resolved:</span>
                    <span className="text-gray-300 ml-2">{formatDate(dispute.resolved_at)}</span>
                  </div>
                )}
              </div>

              {expandedDispute === dispute.id && dispute.resolution && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-md border border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-1">Resolution:</h4>
                  <p className="text-sm text-gray-300">{dispute.resolution}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-gray-800 pt-3 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 text-xs"
              >
                View Election
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(dispute.id)}
                className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 text-xs"
              >
                {expandedDispute === dispute.id ? (
                  <>
                    Less <ChevronUp className="ml-1 w-3 h-3" />
                  </>
                ) : (
                  <>
                    More <ChevronDown className="ml-1 w-3 h-3" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

