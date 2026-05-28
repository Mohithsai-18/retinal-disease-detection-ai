import torch
import numpy as np
import cv2
import base64
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
import matplotlib.pyplot as plt

class GradCamGenerator:
    def __init__(self, model):
        self.model = model
        # Target the last convolutional layer of the EfficientNet backbone
        target_layer = [model.get_cam_layer()]
        self.cam = GradCAM(model=model, target_layers=target_layer)

    def generate(self, input_tensor, original_image_np=None, target_class=None):
        """
        Generate Grad-CAM heatmap.
        input_tensor: Preprocessed image tensor [1, C, H, W]
        original_image_np: Original RGB image normalized between 0-1 for overlay
        target_class: Class index to generate CAM for (None for top predicted class)
        """
        targets = None
        if target_class is not None:
            targets = [ClassifierOutputTarget(target_class)]
            
        # You can also pass aug_smooth=True and eigen_smooth=True for better looking CAMs
        grayscale_cam = self.cam(input_tensor=input_tensor, targets=targets)

        # In this example grayscale_cam has only one image in the batch
        grayscale_cam = grayscale_cam[0, :]

        if original_image_np is not None:
            # Ensure original image is 0-1 float32
            if original_image_np.dtype == np.uint8:
                rgb_img = np.float32(original_image_np) / 255.0
            else:
                rgb_img = original_image_np
                
            visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True, colormap=cv2.COLORMAP_JET)
            return grayscale_cam, visualization
        
        return grayscale_cam, None
        
    def generate_base64_overlay(self, input_tensor, original_image_np, target_class=None):
        """Generate heatmap and return as base64 string for API response."""
        _, visualization = self.generate(input_tensor, original_image_np, target_class)
        
        # Convert RGB to BGR for OpenCV encoding
        vis_bgr = cv2.cvtColor(visualization, cv2.COLOR_RGB2BGR)
        _, buffer = cv2.imencode('.jpg', vis_bgr)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{jpg_as_text}"
