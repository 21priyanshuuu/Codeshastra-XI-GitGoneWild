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
from django.utils import timezone
import base64

# Dummy voter list (replace with actual voter IDs from database)
VOTERS = ["addr1", "addr2", "addr3", "addr4"]

def get_merkle_proof(request):
    voter_address = request.GET.get('address')
    if voter_address not in VOTERS:
        return JsonResponse({"error": "Address not found"}, status=400)

    tree = MerkleTree(VOTERS)
    proof = tree.get_proof(VOTERS.index(voter_address))

    return JsonResponse({"merkle_root": tree.get_root(), "proof": proof})

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
        
        # Verify facial data
        facial_data = request.data.get('facial_data')
        if not facial_data:
            return Response(
                {"error": "Facial verification data is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Decode base64 image data
            image_data = base64.b64decode(facial_data)
            
            # Verify facial data
            if not verify_face(voter.facial_data, image_data):
                return Response(
                    {"error": "Facial verification failed"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            return Response(
                {"error": "Failed to verify facial data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Generate Merkle proof
        tree = MerkleTree(VOTERS)
        proof = tree.get_proof(VOTERS.index(voter.voter_id))
        
        # Submit vote to blockchain
        try:
            tx_hash = web3_manager.submit_vote(
                election.id,
                request.data.get('vote_data', {}),
                {
                    'merkle_root': tree.get_root(),
                    'merkle_proof': proof,
                    'voter_id': voter.voter_id
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
            vote_data=request.data.get('vote_data', {}),
            zkp_proof={
                'merkle_root': tree.get_root(),
                'merkle_proof': proof
            },
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

class VoterViewSet(viewsets.ModelViewSet):
    queryset = Voter.objects.all()
    serializer_class = VoterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own voter record
        if self.request.user.is_staff:
            return Voter.objects.all()
        return Voter.objects.filter(user=self.request.user)

