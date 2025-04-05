from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class Election(models.Model):
    VOTING_METHODS = [
        ('APPROVAL', 'Approval Voting'),
        ('RANKED', 'Ranked Choice Voting'),
        ('QUADRATIC', 'Quadratic Voting'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    voting_method = models.CharField(max_length=50)
    candidates = models.JSONField(default=list)
    contract_address = models.CharField(max_length=42, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Voter(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    voter_id = models.CharField(max_length=100, unique=True)
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.voter_id})"

class Vote(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE)
    vote_data = models.JSONField()
    zkp_proof = models.JSONField()
    transaction_hash = models.CharField(max_length=66)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('election', 'voter')

    def __str__(self):
        return f"Vote by {self.voter} in {self.election}"

class Dispute(models.Model):
    DISPUTE_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('RESOLVED', 'Resolved'),
        ('REJECTED', 'Rejected')
    ]

    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    raised_by = models.ForeignKey(Voter, on_delete=models.CASCADE)
    description = models.TextField()
    evidence = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=DISPUTE_STATUS_CHOICES, default='PENDING')
    resolution = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    contract_dispute_id = models.CharField(max_length=66, null=True, blank=True)

    def __str__(self):
        return f"Dispute by {self.raised_by} for {self.election}"

class ElectionResult(models.Model):
    election = models.OneToOneField(Election, on_delete=models.CASCADE)
    results = models.JSONField()  # Store final election results
    is_final = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Results for {self.election.title}"
