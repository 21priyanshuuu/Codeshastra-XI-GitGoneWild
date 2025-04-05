from django.shortcuts import render
from django.http import JsonResponse
from .merkle import MerkleTree
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Election, Voter, Vote, Dispute
from .serializers import (
    ElectionSerializer,
    VoterSerializer,
    VoteSerializer,
    DisputeSerializer
)
from .web3_utils import web3_manager
from .face_utils import verify_face
from django.utils import timezone
from django.core.cache import cache
import base64

def get_voter_merkle_tree():
    """Get or create Merkle tree from voter addresses"""
    tree = cache.get('voter_merkle_tree')
    if not tree:
        # Get all verified voters' wallet addresses
        voters = [v.wallet_address for v in Voter.objects.filter(is_verified=True)]
        tree = MerkleTree(voters)
        # Cache for 1 hour
        cache.set('voter_merkle_tree', tree, 3600)
    return tree

def get_merkle_proof(request):
    voter_address = request.GET.get('address')
    if not voter_address:
        return JsonResponse({"error": "Address is required"}, status=400)

    tree = get_voter_merkle_tree()
    try:
        # Get voter's index in the tree
        voters = [v.wallet_address for v in Voter.objects.filter(is_verified=True)]
        voter_index = voters.index(voter_address)
        proof = tree.get_proof(voter_index)
        return JsonResponse({"merkle_root": tree.get_root(), "proof": proof})
    except ValueError:
        return JsonResponse({"error": "Address not found"}, status=400)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class ElectionViewSet(viewsets.ModelViewSet):
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def create_election(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Create election on blockchain
        try:
            voting_contract = web3_manager.get_contract('voting_core')
            tx_hash = voting_contract.functions.createElection(
                request.data['title'],
                request.data['description'],
                int(request.data['start_time'].timestamp()),
                int(request.data['end_time'].timestamp()),
                request.data['voting_method'],
                request.data.get('candidates', [])
            ).transact()

            # Get the contract address from the transaction receipt
            tx_receipt = web3_manager.w3.eth.get_transaction_receipt(tx_hash)
            contract_address = tx_receipt.contractAddress

            # Save election with contract address
            election = serializer.save(
                contract_address=contract_address,
                is_active=True
            )

            return Response(ElectionSerializer(election).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Failed to create election on blockchain: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def cast_vote(self, request, pk=None):
        election = self.get_object()
        voter = get_object_or_404(Voter, user=request.user)
        
        # Check if election is active
        if not election.is_active:
            return Response(
                {"error": "Election is not active"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if voter has already voted
        if Vote.objects.filter(election=election, voter=voter).exists():
            return Response(
                {"error": "Voter has already cast a vote"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get vote data and nullifier hash
        vote_data = request.data.get('vote_data')
        nullifier_hash = request.data.get('nullifier_hash')
        
        if not vote_data or not nullifier_hash:
            return Response(
                {"error": "Vote data and nullifier hash are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if nullifier has been used
        if Vote.objects.filter(nullifier_hash=nullifier_hash).exists():
            return Response(
                {"error": "Vote nullifier has already been used"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get Merkle proof
        tree = get_voter_merkle_tree()
        voters = [v.wallet_address for v in Voter.objects.filter(is_verified=True)]
        try:
            voter_index = voters.index(voter.wallet_address)
            merkle_proof = tree.get_proof(voter_index)
        except ValueError:
            return Response(
                {"error": "Voter not found in Merkle tree"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify ZKP
        try:
            is_valid = web3_manager.verify_vote(
                merkle_proof,
                vote_data.get('signal'),
                nullifier_hash,
                tree.get_root()
            )
            if not is_valid:
                return Response(
                    {"error": "ZKP verification failed"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {"error": f"Failed to verify ZKP: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Submit vote to blockchain
        try:
            tx_hash = web3_manager.submit_vote(
                election.id,
                vote_data,
                {
                    'merkle_root': tree.get_root(),
                    'merkle_proof': merkle_proof,
                    'nullifier_hash': nullifier_hash,
                    'signal': vote_data.get('signal')
                }
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to submit vote to blockchain: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create vote record
        vote = Vote.objects.create(
            election=election,
            voter=voter,
            vote_data=vote_data,
            zkp_proof={
                'merkle_root': tree.get_root(),
                'merkle_proof': merkle_proof,
                'nullifier_hash': nullifier_hash,
                'signal': vote_data.get('signal')
            },
            nullifier_hash=nullifier_hash,
            transaction_hash=tx_hash,
            is_verified=True
        )
        
        return Response(VoteSerializer(vote).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def raise_dispute(self, request, pk=None):
        election = self.get_object()
        voter = get_object_or_404(Voter, user=request.user)
        
        # Create dispute record
        dispute = Dispute.objects.create(
            election=election,
            raised_by=voter,
            description=request.data.get('description', ''),
            evidence=request.data.get('evidence', {})
        )
        
        # Submit dispute to blockchain
        try:
            tx_hash = web3_manager.raise_dispute(
                election.id,
                {
                    'description': dispute.description,
                    'evidence': dispute.evidence
                }
            )
            dispute.contract_dispute_id = tx_hash
            dispute.save()
        except Exception as e:
            return Response(
                {"error": f"Failed to submit dispute to blockchain: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(DisputeSerializer(dispute).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def resolve_dispute(self, request, pk=None):
        election = self.get_object()
        dispute_id = request.data.get('dispute_id')
        resolution = request.data.get('resolution')
        
        if not dispute_id or not resolution:
            return Response(
                {"error": "Dispute ID and resolution are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        dispute = get_object_or_404(Dispute, id=dispute_id, election=election)
        
        # Submit resolution to blockchain
        try:
            tx_hash = web3_manager.resolve_dispute(
                election.id,
                dispute.contract_dispute_id,
                resolution
            )
            
            # Update dispute status
            dispute.status = 'resolved'
            dispute.resolution = resolution
            dispute.resolved_at = timezone.now()
            dispute.save()
            
            return Response(DisputeSerializer(dispute).data)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to resolve dispute on blockchain: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def finalize_election(self, request, pk=None):
        election = self.get_object()
        
        if election.end_time > timezone.now():
            return Response(
                {"error": "Cannot finalize election before end time"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not election.is_active:
            return Response(
                {"error": "Election is already finalized"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get final results from blockchain
        try:
            results = web3_manager.get_election_results(election.id)
            
            # Create election result record
            from .models import ElectionResult
            result = ElectionResult.objects.create(
                election=election,
                results=results,
                finalized_at=timezone.now()
            )
            
            # Update election status
            election.is_active = False
            election.save()
            
            return Response({
                "message": "Election finalized successfully",
                "results": results
            })
            
        except Exception as e:
            return Response(
                {"error": f"Failed to finalize election: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def get_results(self, request, pk=None):
        election = self.get_object()
        
        if election.is_active:
            return Response(
                {"error": "Cannot get results before election is finalized"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from .models import ElectionResult
            result = get_object_or_404(ElectionResult, election=election)
            
            return Response({
                "election": ElectionSerializer(election).data,
                "results": result.results,
                "finalized_at": result.finalized_at
            })
            
        except ElectionResult.DoesNotExist:
            return Response(
                {"error": "Results not found for this election"},
                status=status.HTTP_404_NOT_FOUND
            )

class VoterViewSet(viewsets.ModelViewSet):
    queryset = Voter.objects.all()
    serializer_class = VoterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own voter record
        if self.request.user.is_staff:
            return Voter.objects.all()
        return Voter.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Clear Merkle tree cache when new voter is added
        cache.delete('voter_merkle_tree')
        serializer.save()

    def perform_update(self, serializer):
        # Clear Merkle tree cache when voter is updated
        cache.delete('voter_merkle_tree')
        serializer.save()

