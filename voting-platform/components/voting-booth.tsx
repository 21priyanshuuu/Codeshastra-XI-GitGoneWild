"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, CheckCircle, Info } from "lucide-react"
import { ethers } from "ethers"

interface VotingBoothProps {
  election: any
  voter: any
  onVoteSubmitted: () => void
}

export function VotingBooth({ election, voter, onVoteSubmitted }: VotingBoothProps) {
  const { toast } = useToast()
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [rankedCandidates, setRankedCandidates] = useState<{ [key: string]: number }>({})
  const [quadraticVotes, setQuadraticVotes] = useState<{ [key: string]: number }>({})
  const [remainingCredits, setRemainingCredits] = useState(100)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handleApprovalVoteChange = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates((prev) => [...prev, candidateId])
    } else {
      setSelectedCandidates((prev) => prev.filter((id) => id !== candidateId))
    }
  }

  const handleRankedVoteChange = (candidateId: string, rank: number) => {
    setRankedCandidates((prev) => ({
      ...prev,
      [candidateId]: rank,
    }))
  }

  const handleQuadraticVoteChange = (candidateId: string, votes: number) => {
    const oldVotes = quadraticVotes[candidateId] || 0
    const oldCost = oldVotes * oldVotes
    const newCost = votes * votes
    const costDifference = newCost - oldCost

    if (remainingCredits - costDifference < 0) {
      toast({
        title: "Not enough credits",
        description: "You don't have enough credits for this allocation.",
        variant: "destructive",
      })
      return
    }

    setQuadraticVotes((prev) => ({
      ...prev,
      [candidateId]: votes,
    }))

    setRemainingCredits((prev) => prev - costDifference)
  }

  const validateVote = () => {
    if (election.voting_method === "APPROVAL" && selectedCandidates.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate.",
        variant: "destructive",
      })
      return false
    }

    if (election.voting_method === "RANKED") {
      const ranks = Object.values(rankedCandidates)
      if (ranks.length === 0) {
        toast({
          title: "No candidates ranked",
          description: "Please rank at least one candidate.",
          variant: "destructive",
        })
        return false
      }

      // Check for duplicate ranks
      const uniqueRanks = new Set(ranks)
      if (uniqueRanks.size !== ranks.length) {
        toast({
          title: "Duplicate ranks",
          description: "Please assign a unique rank to each selected candidate.",
          variant: "destructive",
        })
        return false
      }
    }

    if (election.voting_method === "QUADRATIC" && Object.keys(quadraticVotes).length === 0) {
      toast({
        title: "No votes allocated",
        description: "Please allocate votes to at least one candidate.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const prepareVoteData = () => {
    let voteData

    switch (election.voting_method) {
      case "APPROVAL":
        voteData = {
          type: "APPROVAL",
          selections: selectedCandidates,
        }
        break
      case "RANKED":
        voteData = {
          type: "RANKED",
          rankings: rankedCandidates,
        }
        break
      case "QUADRATIC":
        voteData = {
          type: "QUADRATIC",
          allocations: quadraticVotes,
        }
        break
      default:
        voteData = {
          type: "UNKNOWN",
          data: {},
        }
    }

    return voteData
  }

  const nextStep = () => {
    if (step === 1) {
      if (!validateVote()) return
      setStep(2)
    }
  }

  const prevStep = () => {
    setStep(1)
  }

  const submitVote = async () => {
    if (!validateVote()) return

    setLoading(true)

    try {
      // Connect to wallet
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Generate a random nullifier hash
      const nullifierHash = ethers.hexlify(ethers.randomBytes(32))

      // Prepare vote data
      const voteData = prepareVoteData()

      // Get Merkle proof
      const merkleResponse = await fetch(`http://localhost:8000/api/merkle-proof/?address=${voter.wallet_address}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })

      if (!merkleResponse.ok) {
        throw new Error("Failed to get Merkle proof")
      }

      const merkleData = await merkleResponse.json()

      // Submit vote to backend
      const response = await fetch(`http://localhost:8000/api/elections/${election.id}/cast_vote/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          vote_data: voteData,
          nullifier_hash: nullifierHash,
          merkle_proof: merkleData.proof,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit vote")
      }

      // Call onVoteSubmitted callback
      onVoteSubmitted()
    } catch (error) {
      console.error("Vote submission error:", error)
      toast({
        title: "Vote Submission Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderVotingInterface = () => {
    switch (election.voting_method) {
      case "APPROVAL":
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400">Approval Voting</h4>
                  <p className="text-xs text-blue-300/80">
                    Select all candidates you approve of. You can select multiple candidates.
                  </p>
                </div>
              </div>
            </div>

            {election.candidates.map((candidate: any, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <Checkbox
                  id={`candidate-${index}`}
                  checked={selectedCandidates.includes(candidate.id)}
                  onCheckedChange={(checked) => handleApprovalVoteChange(candidate.id, checked === true)}
                  className="mt-1"
                />
                <div className="grid gap-1.5">
                  <Label htmlFor={`candidate-${index}`} className="text-base font-medium text-white">
                    {candidate.name}
                  </Label>
                  {candidate.description && <p className="text-sm text-gray-400">{candidate.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )

      case "RANKED":
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400">Ranked Choice Voting</h4>
                  <p className="text-xs text-blue-300/80">
                    Rank the candidates in order of preference. Rank 1 is your top choice.
                  </p>
                </div>
              </div>
            </div>

            {election.candidates.map((candidate: any, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border border-gray-800 rounded-md bg-gray-900/50"
              >
                <div className="flex-1">
                  <h4 className="text-base font-medium text-white">{candidate.name}</h4>
                  {candidate.description && <p className="text-sm text-gray-400">{candidate.description}</p>}
                </div>

                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    max={election.candidates.length}
                    value={rankedCandidates[candidate.id] || ""}
                    onChange={(e) =>
                      handleRankedVoteChange(candidate.id, e.target.value ? Number.parseInt(e.target.value) : 0)
                    }
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
            ))}
          </div>
        )

      case "QUADRATIC":
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400">Quadratic Voting</h4>
                  <p className="text-xs text-blue-300/80">
                    Allocate votes to candidates. The cost of votes increases quadratically. You have {remainingCredits}{" "}
                    credits remaining.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-800 h-2 rounded-full mb-6">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                style={{ width: `${(remainingCredits / 100) * 100}%` }}
              />
            </div>

            {election.candidates.map((candidate: any, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border border-gray-800 rounded-md bg-gray-900/50"
              >
                <div className="flex-1">
                  <h4 className="text-base font-medium text-white">{candidate.name}</h4>
                  {candidate.description && <p className="text-sm text-gray-400">{candidate.description}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={quadraticVotes[candidate.id] === 0 || quadraticVotes[candidate.id] === undefined}
                    onClick={() => handleQuadraticVoteChange(candidate.id, (quadraticVotes[candidate.id] || 0) - 1)}
                    className="h-8 w-8 border-gray-700"
                  >
                    -
                  </Button>

                  <div className="w-12 text-center">
                    <span className="text-white">{quadraticVotes[candidate.id] || 0}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuadraticVoteChange(candidate.id, (quadraticVotes[candidate.id] || 0) + 1)}
                    className="h-8 w-8 border-gray-700"
                  >
                    +
                  </Button>

                  <div className="w-16 text-right">
                    <span className="text-xs text-gray-400">Cost: {(quadraticVotes[candidate.id] || 0) ** 2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-400 mb-2">Unsupported Voting Method</h3>
            <p className="text-gray-400">
              The voting method for this election is not supported by the current interface.
            </p>
          </div>
        )
    }
  }

  const renderConfirmation = () => {
    let voteDetails

    switch (election.voting_method) {
      case "APPROVAL":
        voteDetails = (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Selected Candidates:</h4>
            <ul className="list-disc list-inside space-y-1">
              {selectedCandidates.length === 0 ? (
                <li className="text-gray-500">None selected</li>
              ) : (
                election.candidates
                  .filter((c: any) => selectedCandidates.includes(c.id))
                  .map((c: any, i: number) => (
                    <li key={i} className="text-gray-300">
                      {c.name}
                    </li>
                  ))
              )}
            </ul>
          </div>
        )
        break

      case "RANKED":
        const sortedRankings = Object.entries(rankedCandidates)
          .sort((a, b) => a[1] - b[1])
          .map(([candidateId, rank]) => {
            const candidate = election.candidates.find((c: any) => c.id === candidateId)
            return { name: candidate?.name, rank }
          })

        voteDetails = (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Your Rankings:</h4>
            <ul className="list-disc list-inside space-y-1">
              {sortedRankings.length === 0 ? (
                <li className="text-gray-500">None ranked</li>
              ) : (
                sortedRankings.map((item, i) => (
                  <li key={i} className="text-gray-300">
                    {item.rank}. {item.name}
                  </li>
                ))
              )}
            </ul>
          </div>
        )
        break

      case "QUADRATIC":
        const allocations = Object.entries(quadraticVotes)
          .filter(([_, votes]) => votes > 0)
          .sort((a, b) => b[1] - a[1])
          .map(([candidateId, votes]) => {
            const candidate = election.candidates.find((c: any) => c.id === candidateId)
            return { name: candidate?.name, votes, cost: votes * votes }
          })

        voteDetails = (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Your Vote Allocations:</h4>
            <ul className="list-disc list-inside space-y-1">
              {allocations.length === 0 ? (
                <li className="text-gray-500">No votes allocated</li>
              ) : (
                allocations.map((item, i) => (
                  <li key={i} className="text-gray-300">
                    {item.name}: {item.votes} votes (cost: {item.cost})
                  </li>
                ))
              )}
            </ul>
            <p className="text-sm text-gray-400 mt-2">Total cost: {100 - remainingCredits} credits</p>
          </div>
        )
        break

      default:
        voteDetails = <p className="text-gray-500">Vote details unavailable</p>
    }

    return (
      <div className="space-y-6">
        <div className="bg-green-900/20 border border-green-800/50 rounded-md p-4">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-green-400">Confirm Your Vote</h4>
              <p className="text-xs text-green-300/80">
                Please review your vote before submitting. Once submitted, your vote cannot be changed.
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Vote Summary</CardTitle>
            <CardDescription>Election: {election.title}</CardDescription>
          </CardHeader>
          <CardContent>{voteDetails}</CardContent>
        </Card>

        <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-blue-400">Zero-Knowledge Proof</h4>
              <p className="text-xs text-blue-300/80">
                When you submit your vote, a zero-knowledge proof will be generated to verify your eligibility without
                revealing your identity. Your vote will be recorded on the blockchain anonymously.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">{step === 1 ? "Cast Your Vote" : "Confirm Your Vote"}</CardTitle>
          <CardDescription>
            {step === 1 ? `Select your choice for ${election.title}` : "Review and submit your vote"}
          </CardDescription>
        </CardHeader>

        <CardContent>{step === 1 ? renderVotingInterface() : renderConfirmation()}</CardContent>

        <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
          {step === 2 && (
            <Button variant="outline" onClick={prevStep} disabled={loading} className="border-gray-700 text-gray-300">
              Back
            </Button>
          )}

          <Button
            onClick={step === 1 ? nextStep : submitVote}
            disabled={loading}
            className={`${
              step === 1
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            } ml-auto`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : step === 1 ? (
              "Continue"
            ) : (
              "Submit Vote"
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

