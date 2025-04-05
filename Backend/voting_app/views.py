from django.shortcuts import render
from django.http import JsonResponse
from .merkle import MerkleTree

# Dummy voter list (replace with actual wallet addresses)
VOTERS = ["addr1", "addr2", "addr3", "addr4"]

def get_merkle_proof(request):
    voter_address = request.GET.get('address')
    if voter_address not in VOTERS:
        return JsonResponse({"error": "Address not found"}, status=400)

    tree = MerkleTree(VOTERS)
    proof = tree.get_proof(VOTERS.index(voter_address))

    return JsonResponse({"merkle_root": tree.get_root(), "proof": proof})

