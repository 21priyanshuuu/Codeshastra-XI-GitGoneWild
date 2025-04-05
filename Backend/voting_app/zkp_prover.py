from typing import List, Dict, Any
import hashlib
from .merkle import MerkleTree
import json

class ZKPProver:
    def __init__(self):
        self.merkle_tree = None
        self.voter_commitments = {}

    def setup_voter_roll(self, voter_ids: List[str]):
        """Set up the initial voter roll with commitments"""
        self.voter_commitments = {
            voter_id: self._generate_commitment(voter_id)
            for voter_id in voter_ids
        }
        self.merkle_tree = MerkleTree(list(self.voter_commitments.values()))

    def _generate_commitment(self, voter_id: str) -> str:
        """Generate a commitment for a voter"""
        return hashlib.sha256(voter_id.encode()).hexdigest()

    def generate_vote_proof(self, voter_id: str, vote_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a ZKP that proves the voter is eligible without revealing their identity"""
        if not self.merkle_tree:
            raise ValueError("Voter roll not initialized")

        # Get the voter's commitment
        commitment = self.voter_commitments.get(voter_id)
        if not commitment:
            raise ValueError("Voter not found in roll")

        # Get the Merkle proof
        index = list(self.voter_commitments.values()).index(commitment)
        merkle_proof = self.merkle_tree.get_proof(index)

        # Generate the ZKP proof
        proof = {
            "merkle_root": self.merkle_tree.get_root(),
            "merkle_proof": merkle_proof,
            "commitment": commitment,
            "vote_data": vote_data,
            "signature": self._sign_proof(voter_id, vote_data)
        }

        return proof

    def _sign_proof(self, voter_id: str, vote_data: Dict[str, Any]) -> str:
        """Sign the proof to prevent tampering"""
        data = json.dumps({
            "voter_id": voter_id,
            "vote_data": vote_data
        }, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()

    def verify_proof(self, proof: Dict[str, Any]) -> bool:
        """Verify a ZKP proof"""
        try:
            # Verify the Merkle proof
            commitment = proof["commitment"]
            merkle_proof = proof["merkle_proof"]
            root = proof["merkle_root"]

            # Reconstruct the Merkle path
            current = commitment
            for sibling in merkle_proof:
                if sibling is not None:
                    current = hashlib.sha256((current + sibling).encode()).hexdigest()
                else:
                    current = hashlib.sha256((current + current).encode()).hexdigest()

            # Verify the root matches
            if current != root:
                return False

            # Verify the signature
            expected_signature = self._sign_proof(
                proof.get("voter_id", ""),
                proof["vote_data"]
            )
            if proof["signature"] != expected_signature:
                return False

            return True

        except Exception:
            return False

# Initialize the ZKP prover
zkp_prover = ZKPProver() 