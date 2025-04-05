from django.urls import path
from .views import get_merkle_proof

urlpatterns = [
    path('merkle-proof/', get_merkle_proof, name='merkle-proof'),
]
