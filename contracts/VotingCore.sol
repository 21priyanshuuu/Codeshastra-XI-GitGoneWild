// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IZKPVerifier {
    function verifyZKP(
        address voter,
        bytes32[] calldata proof,
        bytes32 nullifierHash
    ) external view returns (bool);
}

contract VotingCore {
    enum VotingType { Approval, Ranked, Quadratic }
    enum GeoFenceMode { None, SingleIP, IPRange, Location }

    IZKPVerifier public zkpVerifier;

    struct Proposal {
        string description;
        uint voteCount;
    }

    struct Election {
        string name;
        VotingType votingType;
        Proposal[] proposals;
        mapping(address => bool) hasVoted;
        GeoFenceMode geoFenceMode;
        bytes32 allowedIPHash;
        uint32 minAllowedIP;
        uint32 maxAllowedIP;
        string allowedLocation;
        uint256 endTime; // 🆕 New field for voting deadline
    }

    mapping(uint => Election) public elections;
    uint public electionCount;

    constructor(address _zkpVerifierAddress) {
        zkpVerifier = IZKPVerifier(_zkpVerifierAddress);
    }

    function createElection(
        string memory name,
        VotingType votingType,
        string[] memory proposalDescriptions,
        GeoFenceMode geoFenceMode,
        string memory allowedIP,
        uint32 minAllowedIP,
        uint32 maxAllowedIP,
        string memory allowedLocation,
        uint256 endTime // 🆕 end time for the election
    ) public {
        require(endTime > block.timestamp, "End time must be in the future");

        Election storage election = elections[electionCount++];
        election.name = name;
        election.votingType = votingType;
        election.geoFenceMode = geoFenceMode;
        election.endTime = endTime;

        if (geoFenceMode == GeoFenceMode.SingleIP) {
            election.allowedIPHash = keccak256(abi.encodePacked(allowedIP));
        } else if (geoFenceMode == GeoFenceMode.IPRange) {
            election.minAllowedIP = minAllowedIP;
            election.maxAllowedIP = maxAllowedIP;
        } else if (geoFenceMode == GeoFenceMode.Location) {
            election.allowedLocation = allowedLocation;
        }

        for (uint i = 0; i < proposalDescriptions.length; i++) {
            election.proposals.push(Proposal(proposalDescriptions[i], 0));
        }
    }

    function vote(
        uint electionId,
        uint[] memory selectedProposals,
        bytes32[] calldata proof,
        bytes32 nullifierHash,
        string memory voterIPString,
        uint32 voterIPNumeric
    ) public {
        Election storage election = elections[electionId];
        require(!election.hasVoted[msg.sender], "Already voted");
        require(block.timestamp <= election.endTime, "Voting period has ended"); // 🛑 Check if voting is still allowed

        if (election.geoFenceMode == GeoFenceMode.SingleIP) {
            require(
                keccak256(abi.encodePacked(voterIPString)) == election.allowedIPHash,
                "Voting not allowed from your IP"
            );
        } else if (election.geoFenceMode == GeoFenceMode.IPRange) {
            require(
                voterIPNumeric >= election.minAllowedIP && voterIPNumeric <= election.maxAllowedIP,
                "Voting not allowed from your IP range"
            );
        } else if (election.geoFenceMode == GeoFenceMode.Location) {
            require(
                keccak256(abi.encodePacked(voterIPString)) == keccak256(abi.encodePacked(election.allowedLocation)),
                "Voting not allowed from your location"
            );
        }

        bool isEligible = zkpVerifier.verifyZKP(msg.sender, proof, nullifierHash);
        require(isEligible, "ZKP verification failed");

        if (election.votingType == VotingType.Approval) {
            for (uint i = 0; i < selectedProposals.length; i++) {
                election.proposals[selectedProposals[i]].voteCount += 1;
            }
        } else if (election.votingType == VotingType.Ranked) {
            for (uint i = 0; i < selectedProposals.length; i++) {
                election.proposals[selectedProposals[i]].voteCount += (3 - i);
            }
        } else if (election.votingType == VotingType.Quadratic) {
            for (uint i = 0; i < selectedProposals.length; i++) {
                election.proposals[selectedProposals[i]].voteCount += sqrt(1); // Simplified quadratic logic
            }
        }

        election.hasVoted[msg.sender] = true;
    }

    function getResults(uint electionId) public view returns (string[] memory, uint[] memory) {
        Election storage election = elections[electionId];
        string[] memory names = new string[](election.proposals.length);
        uint[] memory counts = new uint[](election.proposals.length);

        for (uint i = 0; i < election.proposals.length; i++) {
            names[i] = election.proposals[i].description;
            counts[i] = election.proposals[i].voteCount;
        }

        return (names, counts);
    }

    function sqrt(uint x) internal pure returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
