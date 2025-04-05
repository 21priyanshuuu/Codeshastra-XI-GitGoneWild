from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    get_merkle_proof,
    ElectionViewSet,
    VoterViewSet
)
from .auth_views import signup, login

router = DefaultRouter()
router.register(r'elections', ElectionViewSet, basename='election')
router.register(r'voters', VoterViewSet, basename='voter')

urlpatterns = [
    path('', include(router.urls)),
    path('merkle-proof/', get_merkle_proof, name='merkle-proof'),
    
    # Auth endpoints
    path('auth/signup/', signup, name='signup'),
    path('auth/login/', login, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
