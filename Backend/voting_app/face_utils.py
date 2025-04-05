import numpy as np
import hashlib
import base64
from typing import Tuple, Optional
import io
from PIL import Image

def encode_facial_data(image_data: bytes) -> Tuple[str, bytes]:
    """
    Process image data and create a hash for verification.
    Uses basic image processing with PIL and NumPy.
    Returns a hash and the processed image data.
    """
    # Convert bytes to PIL Image
    img = Image.open(io.BytesIO(image_data))
    
    # Convert to grayscale
    img = img.convert('L')
    
    # Resize to standard size
    img = img.resize((100, 100))
    
    # Convert to numpy array
    img_array = np.array(img)
    
    # Create a hash of the processed image data
    img_hash = hashlib.sha256(img_array.tobytes()).hexdigest()
    
    # Convert processed image to bytes for storage
    img_bytes = base64.b64encode(img_array.tobytes())
    
    return img_hash, img_bytes

def verify_face(stored_hash: str, current_image_data: bytes, tolerance: float = 0.6) -> bool:
    """
    Verify if the current image matches the stored data.
    Uses image similarity comparison.
    """
    try:
        # Get current image hash and data
        current_hash, current_img_bytes = encode_facial_data(current_image_data)
        
        # First check if hashes match exactly
        if current_hash == stored_hash:
            return True
            
        # Convert current image bytes back to array
        current_img = np.frombuffer(base64.b64decode(current_img_bytes), dtype=np.uint8).reshape(100, 100)
        
        # Convert stored hash to array (assuming it's base64 encoded image data)
        try:
            stored_img = np.frombuffer(base64.b64decode(stored_hash), dtype=np.uint8).reshape(100, 100)
        except:
            # If stored_hash is not valid base64 image data, return False
            return False
        
        # Calculate normalized cross-correlation
        correlation = np.corrcoef(current_img.flatten(), stored_img.flatten())[0, 1]
        
        return correlation >= tolerance
        
    except Exception as e:
        print(f"Error during image verification: {str(e)}")
        return False

def preprocess_image(image_data: bytes) -> bytes:
    """
    Preprocess the image before processing.
    Resizes and normalizes the image.
    """
    # Convert bytes to PIL Image
    img = Image.open(io.BytesIO(image_data))
    
    # Convert to grayscale
    img = img.convert('L')
    
    # Resize if too large
    max_size = 800
    if max(img.size) > max_size:
        ratio = max_size / max(img.size)
        new_size = tuple(int(dim * ratio) for dim in img.size)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Convert back to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG', quality=95)
    return img_byte_arr.getvalue() 