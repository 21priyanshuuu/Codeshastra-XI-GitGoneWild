from web3 import Web3
from eth_account import Account
import json
import os
from typing import Dict, Any

class Web3Manager:
    def __init__(self):
        # Initialize Web3 connection (you'll need to replace with your provider)
        self.w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))  # Replace with your provider
        self.contracts = {}
        self.load_contracts()

    def load_contracts(self):
        """Load all smart contracts"""
        # Get the directory of the current file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        contracts_dir = os.path.join(current_dir, 'contracts')

        contract_paths = {
            'voting_core': os.path.join(contracts_dir, 'VotingCore.json'),
            'zkp_verifier': os.path.join(contracts_dir, 'ZKPVerifier.json'),
            'voter_auth': os.path.join(contracts_dir, 'VoterAuth.json'),
            'dispute_resolution': os.path.join(contracts_dir, 'DisputeResolution.json')
        }

        for name, path in contract_paths.items():
            if not os.path.exists(path):
                print(f"Warning: Contract file not found at {path}")
                continue
                
            with open(path) as f:
                contract_json = json.load(f)
                # Handle different contract formats
                if 'VotingCoreABI' in contract_json:
                    abi = contract_json['VotingCoreABI']
                else:
                    abi = contract_json.get('abi', [])
                
                # Skip placeholder addresses
                address = contract_json['address']
                if address == "0x...":
                    print(f"Warning: Skipping contract {name} with placeholder address")
                    continue
                
                try:
                    # Convert address to checksum format
                    address = self.w3.to_checksum_address(address)
                    self.contracts[name] = self.w3.eth.contract(
                        address=address,
                        abi=abi
                    )
                except Exception as e:
                    print(f"Warning: Failed to load contract {name}: {str(e)}")
                    continue

    def get_contract(self, name: str):
        """Get a specific contract instance"""
        if name not in self.contracts:
            print(f"Warning: Contract {name} not found")
            return None
        return self.contracts.get(name)

    def verify_vote(self, voter_address: str, proof: bytes, nullifier_hash: bytes) -> bool:
        """Verify a ZKP for a vote using the ZKP verifier contract"""
        zkp_contract = self.get_contract('zkp_verifier')
        if not zkp_contract:
            print("Warning: ZKP verifier contract not found, skipping verification")
            return True  # Return True in development mode
            
        return zkp_contract.functions.verifyZKP(
            voter_address,
            proof,
            nullifier_hash
        ).call()

    def authenticate_voter(self, voter_id: str, auth_data: Dict[str, Any]) -> bool:
        """Authenticate a voter using the auth contract"""
        auth_contract = self.get_contract('voter_auth')
        if not auth_contract:
            print("Warning: Voter auth contract not found, skipping authentication")
            return True  # Return True in development mode
            
        return auth_contract.functions.verifyVoter(
            voter_id,
            auth_data['biometric'],
            auth_data['otp']
        ).call()

    def submit_vote(self, election_id: int, vote_data: Dict[str, Any], proof: Dict[str, Any]) -> str:
        """Submit a vote to the voting core contract"""
        voting_contract = self.get_contract('voting_core')
        if not voting_contract:
            print("Warning: Voting core contract not found, skipping blockchain submission")
            return "0x0000000000000000000000000000000000000000000000000000000000000000"  # Return dummy hash in development mode
            
        tx_hash = voting_contract.functions.castVote(
            election_id,
            vote_data,
            proof
        ).transact()
        return tx_hash.hex()

    def raise_dispute(self, election_id: int, dispute_data: Dict[str, Any]) -> str:
        """Raise a dispute using the dispute resolution contract"""
        dispute_contract = self.get_contract('dispute_resolution')
        if not dispute_contract:
            print("Warning: Dispute resolution contract not found, skipping blockchain submission")
            return "0x0000000000000000000000000000000000000000000000000000000000000000"  # Return dummy hash in development mode
            
        tx_hash = dispute_contract.functions.raiseDispute(
            election_id,
            dispute_data
        ).transact()
        return tx_hash.hex()

    def resolve_dispute(self, election_id, dispute_id, resolution):
        """
        Resolve a dispute on the blockchain
        """
        voting_contract = self.get_contract('voting_core')
        tx_hash = voting_contract.functions.resolveDispute(
            election_id,
            dispute_id,
            resolution
        ).transact()
        return tx_hash

    def get_election_results(self, election_id):
        """
        Get final election results from the blockchain
        """
        voting_contract = self.get_contract('voting_core')
        results = voting_contract.functions.getElectionResults(election_id).call()
        
        # Format results into a more readable structure
        formatted_results = {
            'total_votes': results[0],
            'vote_counts': results[1],
            'winner': results[2] if len(results) > 2 else None
        }
        
        return formatted_results

    def get_end_time(self, election_id: int) -> int:
        """
        Get the end time of an election from the blockchain
        """
        voting_contract = self.get_contract('voting_core')
        if not voting_contract:
            print("Warning: Voting core contract not found")
            return 0
            
        return voting_contract.functions.getEndTime(election_id).call()

    def has_voted(self, election_id: int, voter_address: str) -> bool:
        """
        Check if a voter has already voted in an election
        """
        voting_contract = self.get_contract('voting_core')
        if not voting_contract:
            print("Warning: Voting core contract not found")
            return False
            
        return voting_contract.functions.hasVoted(election_id, voter_address).call()

    def get_election_status(self, election_id: int) -> str:
        """
        Get the current status of an election
        Returns: 'pending', 'active', 'ended', or 'finalized'
        """
        voting_contract = self.get_contract('voting_core')
        if not voting_contract:
            print("Warning: Voting core contract not found")
            return 'unknown'
            
        status_code = voting_contract.functions.getElectionStatus(election_id).call()
        status_map = {
            0: 'pending',
            1: 'active',
            2: 'ended',
            3: 'finalized'
        }
        return status_map.get(status_code, 'unknown')

# Initialize the Web3 manager
web3_manager = Web3Manager() 