from django.contrib import admin
from .models import Election, Voter, Vote, Dispute, ElectionResult

@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'voting_method', 'start_time', 'end_time', 'is_active')
    list_filter = ('voting_method', 'is_active')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)

@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    list_display = ('user', 'voter_id', 'wallet_address', 'is_verified', 'created_at')
    list_filter = ('is_verified',)
    search_fields = ('user__username', 'voter_id', 'wallet_address')
    readonly_fields = ('created_at', 'facial_hash')

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('election', 'voter', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'election')
    search_fields = ('voter__user__username', 'election__title')
    readonly_fields = ('created_at',)

@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display = ('election', 'raised_by', 'status', 'created_at', 'resolved_at')
    list_filter = ('status', 'election')
    search_fields = ('description', 'election__title', 'raised_by__user__username')
    readonly_fields = ('created_at', 'resolved_at')

@admin.register(ElectionResult)
class ElectionResultAdmin(admin.ModelAdmin):
    list_display = ('election', 'is_final', 'created_at', 'updated_at')
    list_filter = ('is_final',)
    search_fields = ('election__title',)
    readonly_fields = ('created_at', 'updated_at')
