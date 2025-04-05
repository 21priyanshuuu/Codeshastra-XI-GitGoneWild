'use client'

import { useState } from 'react'
import { ethers } from 'ethers'


const VOTING_CORE_ABI =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_zkpVerifierAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "enum VotingCore.VotingType",
				"name": "votingType",
				"type": "uint8"
			},
			{
				"internalType": "string[]",
				"name": "proposalDescriptions",
				"type": "string[]"
			},
			{
				"internalType": "enum VotingCore.GeoFenceMode",
				"name": "geoFenceMode",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "allowedIP",
				"type": "string"
			},
			{
				"internalType": "uint32",
				"name": "minAllowedIP",
				"type": "uint32"
			},
			{
				"internalType": "uint32",
				"name": "maxAllowedIP",
				"type": "uint32"
			},
			{
				"internalType": "string",
				"name": "allowedLocation",
				"type": "string"
			}
		],
		"name": "createElection",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "electionCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "elections",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "enum VotingCore.VotingType",
				"name": "votingType",
				"type": "uint8"
			},
			{
				"internalType": "enum VotingCore.GeoFenceMode",
				"name": "geoFenceMode",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "allowedIPHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint32",
				"name": "minAllowedIP",
				"type": "uint32"
			},
			{
				"internalType": "uint32",
				"name": "maxAllowedIP",
				"type": "uint32"
			},
			{
				"internalType": "string",
				"name": "allowedLocation",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "electionId",
				"type": "uint256"
			}
		],
		"name": "getResults",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "electionId",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "selectedProposals",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "proof",
				"type": "bytes32[]"
			},
			{
				"internalType": "bytes32",
				"name": "nullifierHash",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "voterIPString",
				"type": "string"
			},
			{
				"internalType": "uint32",
				"name": "voterIPNumeric",
				"type": "uint32"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "zkpVerifier",
		"outputs": [
			{
				"internalType": "contract IZKPVerifier",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
export const VOTING_CORE_ADDRESS="0xe297df2c519d5af8cb9170a450fbbaeb1d4b53ed"



export default function VotingPage() {
  const [provider, setProvider] = useState<any>()
  const [signer, setSigner] = useState<any>()
  const [contract, setContract] = useState<any>()

  const [electionName, setElectionName] = useState('')
  const [proposals, setProposals] = useState<string[]>(['', ''])
  const [votingType, setVotingType] = useState(0)
  const [geoMode, setGeoMode] = useState(0)
  const [allowedIP, setAllowedIP] = useState('')
  const [allowedLocation, setAllowedLocation] = useState('')
  const [minIP, setMinIP] = useState('')
  const [maxIP, setMaxIP] = useState('')
  const [voteIndex, setVoteIndex] = useState('')
  const [results, setResults] = useState<any[]>([])

  async function connectWallet() {
    const _provider = new ethers.BrowserProvider(window.ethereum)
    const _signer = await _provider.getSigner()
    const _contract = new ethers.Contract(VOTING_CORE_ADDRESS, VOTING_CORE_ABI, _signer)
    setProvider(_provider)
    setSigner(_signer)
    setContract(_contract)
  }

  async function createElection() {
    const tx = await contract.createElection(
      electionName,
      votingType,
      proposals,
      geoMode,
      allowedIP,
      parseInt(minIP || '0'),
      parseInt(maxIP || '0'),
      allowedLocation
    )
    await tx.wait()
    alert('Election created!')
  }

  async function castVote() {
    const proof: `0x${string}`[] = [] // Simulated empty proof for demo
    const nullifier = ethers.keccak256(ethers.toUtf8Bytes('dummy-nullifier'))

    const tx = await contract.vote(
      0, // electionId
      [parseInt(voteIndex)],
      proof,
      nullifier,
      allowedIP || allowedLocation,
      parseInt(minIP || '0')
    )
    await tx.wait()
    alert('Vote cast!')
  }

  async function fetchResults() {
    const res = await contract.getResults(0)
    const names = res[0]
    const counts = res[1].map((bn: any) => parseInt(bn.toString()))
    setResults(names.map((name: string, i: number) => ({ name, count: counts[i] })))
  }

  return (
    <main className="p-6 space-y-6 max-w-xl mx-auto text-black">
      <button onClick={connectWallet} className="px-4 py-2 bg-blue-500 text-white rounded">
        Connect Wallet
      </button>

      <div className="space-y-2 border p-4 rounded bg-gray-100">
        <h2 className="font-bold text-lg">Create Election</h2>
        <input placeholder="Election Name" onChange={e => setElectionName(e.target.value)} className="w-full p-2 rounded" />
        {proposals.map((p, i) => (
          <input key={i} placeholder={`Proposal ${i + 1}`} value={p} onChange={e => {
            const newProps = [...proposals]
            newProps[i] = e.target.value
            setProposals(newProps)
          }} className="w-full p-2" />
        ))}
        <button onClick={() => setProposals([...proposals, ''])} className="text-sm text-blue-600 underline">+ Add Proposal</button>
        <select value={votingType} onChange={e => setVotingType(parseInt(e.target.value))} className="w-full p-2">
          <option value={0}>Approval</option>
          <option value={1}>Ranked</option>
          <option value={2}>Quadratic</option>
        </select>
        <select value={geoMode} onChange={e => setGeoMode(parseInt(e.target.value))} className="w-full p-2">
          <option value={0}>None</option>
          <option value={1}>Single IP</option>
          <option value={2}>IP Range</option>
          <option value={3}>Location</option>
        </select>
        {geoMode === 1 && <input placeholder="Allowed IP" onChange={e => setAllowedIP(e.target.value)} className="w-full p-2" />}
        {geoMode === 2 && (
          <>
            <input placeholder="Min IP (numeric)" onChange={e => setMinIP(e.target.value)} className="w-full p-2" />
            <input placeholder="Max IP (numeric)" onChange={e => setMaxIP(e.target.value)} className="w-full p-2" />
          </>
        )}
        {geoMode === 3 && <input placeholder="Allowed Location" onChange={e => setAllowedLocation(e.target.value)} className="w-full p-2" />}
        <button onClick={createElection} className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
      </div>

      <div className="space-y-2 border p-4 rounded bg-gray-100">
        <h2 className="font-bold text-lg">Cast Vote</h2>
        <input placeholder="Proposal Index to Vote (e.g. 0)" onChange={e => setVoteIndex(e.target.value)} className="w-full p-2" />
        <button onClick={castVote} className="bg-purple-600 text-white px-4 py-2 rounded">Vote</button>
      </div>

      <div className="space-y-2 border p-4 rounded bg-gray-100">
        <h2 className="font-bold text-lg">Results</h2>
        <button onClick={fetchResults} className="bg-gray-700 text-white px-4 py-2 rounded">Fetch Results</button>
        <ul>
          {results.map((r, i) => (
            <li key={i}>{r.name}: {r.count} votes</li>
          ))}
        </ul>
      </div>
    </main>
  )
}
