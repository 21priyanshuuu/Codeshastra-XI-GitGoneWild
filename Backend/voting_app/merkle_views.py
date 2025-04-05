from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.core.cache import cache
from .models import Voter
from .merkle import MerkleTree
from .web3_utils import web3_manager

@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_merkle_root(request):
    """
    Admin-only endpoint to update the Merkle root on-chain
    """
    try:
        # Get all verified voters
        verified_voters = Voter.objects.filter(is_verified=True)
        
        if not verified_voters.exists():
            return Response(
                {"error": "No verified voters found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get wallet addresses
        voter_addresses = [voter.wallet_address for voter in verified_voters]
        
        # Create new Merkle tree
        tree = MerkleTree(voter_addresses)
        new_root = tree.get_root()
        
        # Update root on blockchain
        try:
            tx_hash = web3_manager.update_merkle_root(new_root)
        except Exception as e:
            return Response(
                {"error": f"Failed to update Merkle root on blockchain: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Clear cached Merkle tree
        cache.delete('voter_merkle_tree')
        
        return Response({
            'merkle_root': new_root,
            'voter_addresses': voter_addresses,
            'tx_hash': tx_hash,
            'total_voters': len(voter_addresses)
        })
        
    except Exception as e:
        return Response(
            {"error": f"Failed to update Merkle root: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 