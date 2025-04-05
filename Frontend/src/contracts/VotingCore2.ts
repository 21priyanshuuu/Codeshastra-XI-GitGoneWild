export const VOTING_CORE_ABI=[
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
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "createElection",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
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
			},
			{
				"internalType": "uint256",
				"name": "endTime",
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
export const VOTING_CORE_ADDRESS="0x3ed74726362055d2140648d8276cdd98f418a978"


