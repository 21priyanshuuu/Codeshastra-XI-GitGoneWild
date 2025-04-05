import numpy as np
import hashlib
import base64
from typing import Tuple, Optional
import io
from PIL import Image
import cv2

def encode_facial_data(image_data: bytes) -> Tuple[str, bytes]:
    """
    Process image data and create a hash for verification.
    Uses OpenCV for face detection and feature extraction.
    Returns a hash and the processed image data.
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Load face cascade classifier
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        raise ValueError("No face detected in the image")
    
    if len(faces) > 1:
        raise ValueError("Multiple faces detected in the image")
    
    # Get the face region
    x, y, w, h = faces[0]
    face = gray[y:y+h, x:x+w]
    
    # Resize to standard size
    face = cv2.resize(face, (100, 100))
    
    # Create a hash of the processed image data
    img_hash = hashlib.sha256(face.tobytes()).hexdigest()
    
    # Convert processed image to bytes for storage
    _, img_encoded = cv2.imencode('.jpg', face)
    img_bytes = img_encoded.tobytes()
    
    return img_hash, img_bytes

def verify_face(stored_data: bytes, new_data: bytes, similarity_threshold: float = 0.8) -> bool:
    """
    Verify if two face images match using OpenCV template matching
    
    Args:
        stored_data: The stored facial data as bytes
        new_data: The new facial data to verify as bytes
        similarity_threshold: Threshold for similarity (0-1, higher is stricter)
        
    Returns:
        bool: True if faces match, False otherwise
    """
    try:
        # Convert stored data to numpy array
        stored_nparr = np.frombuffer(stored_data, np.uint8)
        stored_face = cv2.imdecode(stored_nparr, cv2.IMREAD_GRAYSCALE)
        
        # Process new image
        new_hash, new_face_bytes = encode_facial_data(new_data)
        new_face_nparr = np.frombuffer(new_face_bytes, np.uint8)
        new_face = cv2.imdecode(new_face_nparr, cv2.IMREAD_GRAYSCALE)
        
        # Ensure both images are the same size
        if stored_face.shape != new_face.shape:
            new_face = cv2.resize(new_face, (stored_face.shape[1], stored_face.shape[0]))
        
        # Calculate similarity using template matching
        result = cv2.matchTemplate(stored_face, new_face, cv2.TM_CCOEFF_NORMED)
        similarity = np.max(result)
        
        return similarity >= similarity_threshold
        
    except Exception as e:
        print(f"Face verification error: {str(e)}")
        return False

def preprocess_image(image_data: bytes) -> bytes:
    """
    Preprocess the image before processing.
    Resizes and normalizes the image.
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Resize if too large
    max_size = 800
    h, w = gray.shape
    if max(h, w) > max_size:
        ratio = max_size / max(h, w)
        new_size = (int(w * ratio), int(h * ratio))
        gray = cv2.resize(gray, new_size)
    
    # Enhance contrast
    gray = cv2.equalizeHist(gray)
    
    # Convert back to bytes
    _, img_encoded = cv2.imencode('.jpg', gray)
    return img_encoded.tobytes() 