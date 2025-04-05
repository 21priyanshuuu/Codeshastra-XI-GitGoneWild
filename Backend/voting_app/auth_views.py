from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from .models import Voter
from .serializers import VoterSerializer
from .face_utils import encode_facial_data, verify_face
import base64

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    facial_data = request.data.get('facial_data')  # Base64 encoded image data
    
    if not all([username, password, facial_data]):
        return Response(
            {"error": "Username, password and facial data are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decode base64 image data
        image_data = base64.b64decode(facial_data)
        
        # Process facial data
        facial_hash, _ = encode_facial_data(image_data)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            password=password
        )
        
        # Create voter with facial data
        voter = Voter.objects.create(
            user=user,
            voter_id=f"VOTER_{user.id}",
            facial_data=facial_hash,
            is_verified=True  # Set to True after successful facial registration
        )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'voter': VoterSerializer(voter).data
        }, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": "Failed to process facial data"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    facial_data = request.data.get('facial_data')  # Base64 encoded image data
    
    if not all([username, password, facial_data]):
        return Response(
            {"error": "Username, password and facial data are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        # Get voter
        voter = Voter.objects.get(user=user)
        
        # Decode base64 image data
        image_data = base64.b64decode(facial_data)
        
        # Verify facial data
        if not verify_face(voter.facial_data, image_data):
            return Response(
                {"error": "Facial verification failed"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'voter': VoterSerializer(voter).data
        })
        
    except Exception as e:
        return Response(
            {"error": "Failed to verify facial data"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_face_for_voting(request):
    """
    Endpoint to verify facial data before casting a vote.
    """
    facial_data = request.data.get('facial_data')  # Base64 encoded image data
    voter_id = request.data.get('voter_id')
    
    if not all([facial_data, voter_id]):
        return Response(
            {"error": "Facial data and voter ID are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get voter
        voter = Voter.objects.get(voter_id=voter_id)
        
        # Decode base64 image data
        image_data = base64.b64decode(facial_data)
        
        # Verify facial data
        if not verify_face(voter.facial_data, image_data):
            return Response(
                {"error": "Facial verification failed"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response({"verified": True})
        
    except Voter.DoesNotExist:
        return Response(
            {"error": "Voter not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": "Failed to verify facial data"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 