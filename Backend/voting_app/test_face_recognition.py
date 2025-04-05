import numpy as np
import os
from face_utils import encode_facial_data, verify_face, preprocess_image

def test_face_recognition():
    """
    Test the image processing and verification implementation.
    """
    # Create test images directory if it doesn't exist
    test_dir = os.path.join(os.path.dirname(__file__), 'test_images')
    os.makedirs(test_dir, exist_ok=True)
    
    # Check if we have test images
    test_images = [f for f in os.listdir(test_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if len(test_images) < 2:
        print("Please add at least two test images (registration.jpg and verification.jpg) to the test_images directory")
        return
    
    try:
        # Test registration
        with open(os.path.join(test_dir, test_images[0]), 'rb') as f:
            registration_image = f.read()
        
        # Test preprocessing
        processed_image = preprocess_image(registration_image)
        print("✓ Image preprocessing successful")
        
        # Test image encoding
        img_hash, img_data = encode_facial_data(processed_image)
        print("✓ Image encoding successful")
        print(f"Generated hash: {img_hash[:20]}...")
        
        # Test verification with same image (should pass)
        same_result = verify_face(img_data, processed_image)
        print(f"✓ Self-verification {'passed' if same_result else 'failed'}")
        
        # Test verification with different image
        with open(os.path.join(test_dir, test_images[1]), 'rb') as f:
            verification_image = f.read()
        
        different_result = verify_face(img_data, verification_image)
        print(f"✓ Different image verification {'passed' if different_result else 'failed'}")
        
    except Exception as e:
        print(f"Error during testing: {str(e)}")

if __name__ == "__main__":
    test_face_recognition() 