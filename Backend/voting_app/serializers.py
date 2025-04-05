from rest_framework import serializers
from .models import Election, Voter, Vote, Dispute

class ElectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Election
        fields = '__all__'
        read_only_fields = ('contract_address', 'is_active', 'created_at')

class VoterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voter
        fields = ('id', 'user', 'voter_id', 'is_verified', 'created_at')
        read_only_fields = ('voter_id', 'is_verified', 'created_at')

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = '__all__'
        read_only_fields = ('transaction_hash', 'is_verified', 'created_at')

class DisputeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = '__all__'
        read_only_fields = ('status', 'resolution', 'created_at', 'resolved_at', 'contract_dispute_id') 