// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ZKPVerifier
/// @notice Verifies voter eligibility using Merkle Proofs (for ZKP integration).
contract ZKPVerifier {
    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    /// @notice Verifies Merkle proof for voter eligibility.
    /// @param voter The voter's wallet address.
    /// @param proof The Merkle proof path.
    /// @param nullifierHash Included for ZKP-style compatibility (not used here).
    /// @return True if the voter is eligible (leaf -> root match).
    function verifyZKP(
        address voter,
        bytes32[] calldata proof,
        bytes32 nullifierHash // included for future ZK-based upgrades
    ) external view returns (bool) {
        bytes32 computedHash = keccak256(abi.encodePacked(voter));

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash < proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == merkleRoot;
    }
}
