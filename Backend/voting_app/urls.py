from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    get_merkle_proof,
    ElectionViewSet,
    VoterViewSet,
    VoteViewSet
)
from .auth_views import signup, login, verify_face_for_voting
from .merkle_views import update_merkle_root

router = DefaultRouter()
router.register(r'elections', ElectionViewSet, basename='election')
router.register(r'voters', VoterViewSet, basename='voter')
router.register(r'votes', VoteViewSet, basename='vote')

urlpatterns = [
    path('', include(router.urls)),
    path('merkle-proof/', get_merkle_proof, name='merkle-proof'),
    path('merkle/update/', update_merkle_root, name='update-merkle-root'),
    
    # Auth endpoints
    path('auth/signup/', signup, name='signup'),
    path('auth/login/', login, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify-face/', verify_face_for_voting, name='verify_face'),
]
