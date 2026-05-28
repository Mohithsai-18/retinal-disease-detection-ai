import os
import cv2
import numpy as np
import pandas as pd

# Create directories if they don't exist
os.makedirs('data/raw', exist_ok=True)
os.makedirs('data', exist_ok=True)
os.makedirs('weights', exist_ok=True)

# Generate mock train.csv
data = {
    'id_code': [f'mock_image_{i}' for i in range(50)],
    'diagnosis': [i % 5 for i in range(50)] # 5 classes (0 to 4)
}
df = pd.DataFrame(data)
df.to_csv('data/train.csv', index=False)

# Generate 50 mock images
for i in range(50):
    img_name = f'mock_image_{i}.png'
    img_path = os.path.join('data/raw', img_name)
    
    # Create a random RGB image with typical fundus dimensions
    img = np.random.randint(0, 255, (380, 380, 3), dtype=np.uint8)
    
    # Add a mock circular "retina" 
    cv2.circle(img, (190, 190), 180, (50, 50, 150), -1)
    
    cv2.imwrite(img_path, img)

print("Mock dataset generated successfully in data/raw/ with train.csv")
