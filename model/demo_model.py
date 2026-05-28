import numpy as np
import base64
import cv2
import uuid
from pathlib import Path
import os
from datetime import datetime

class DemoModel:
    """
    A mock model for the immediate demo before training is complete.
    It simulates an inference pass and returns realistic fake data based on image properties.
    """
    def __init__(self):
        self.device = 'cpu'
        self.classes = [
            "Normal Retina: No Diabetic Retinopathy",
            "Mild DR: Early Stage Diabetic Retinopathy",
            "Moderate DR: Progressing Diabetic Retinopathy",
            "Severe DR: High-Risk Diabetic Retinopathy",
            "Advanced DR: Critical Proliferative Diabetic Retinopathy",
            "Glaucoma: Optic Nerve Damage",
            "AMD: Age-Related Macular Degeneration",
            "Healthy Eye: Normal"
        ]
        print("Initialized Demo Model (Simulation Mode)")

    def predict(self, image_path):
        """Simulate prediction and GradCAM generation."""
        # Just to ensure we're doing "work"
        import time
        time.sleep(1.5)
        
        # Create a consistent "random" prediction based on the file name/size
        img_size = os.path.getsize(image_path)
        np.random.seed(img_size % 10000)
        
        # Generate probabilities
        probs = np.random.dirichlet(np.ones(len(self.classes)) * 2)
        
        # Determine top prediction
        pred_idx = np.argmax(probs)
        confidence = probs[pred_idx]
        
        # We'll artificially bump the highest to make it look confident
        if confidence < 0.6:
            probs *= 0.5
            probs[pred_idx] += 0.5
            probs = probs / np.sum(probs)
            confidence = probs[pred_idx]
            
        pred_label = self.classes[pred_idx]
        
        scores_dict = {self.classes[i]: float(probs[i]) for i in range(len(self.classes))}
        
        # Generate pseudo-GradCAM
        img_b64 = self._generate_fake_gradcam(image_path, pred_idx)
        
        # Determine severity details
        severity_details = self._get_severity_details(pred_idx)
            
        return {
            "prediction": pred_label,
            "confidence": float(confidence),
            "class_probs": scores_dict,
            "heatmap_base64": img_b64,
            "severity_details": severity_details
        }
        
    def _generate_fake_gradcam(self, image_path, pred_idx):
        img = cv2.imread(image_path)
        if img is None:
            return ""
            
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (380, 380))
        
        # Generate a fake heatmap
        heatmap = np.zeros((380, 380), dtype=np.float32)
        
        # Add random blobs based on prediction type
        np.random.seed(int(datetime.now().timestamp()))
        num_blobs = np.random.randint(2, 6)
        
        for _ in range(num_blobs):
            center_x = np.random.randint(50, 330)
            center_y = np.random.randint(50, 330)
            radius = np.random.randint(20, 80)
            
            y, x = np.ogrid[:380, :380]
            mask = (x - center_x)**2 + (y - center_y)**2 <= radius**2
            
            intensity = np.random.uniform(0.5, 1.0)
            heatmap[mask] += intensity
            
        # Smooth and normalize
        heatmap = cv2.GaussianBlur(heatmap, (101, 101), 0)
        heatmap = (heatmap - np.min(heatmap)) / (np.max(heatmap) - np.min(heatmap) + 1e-8)
        
        # Custom colormap overlay (Jet-like but prettier)
        heatmap_cv = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        heatmap_cv = cv2.cvtColor(heatmap_cv, cv2.COLOR_BGR2RGB)
        
        # Blend
        alpha = 0.5
        overlay = cv2.addWeighted(img, 1-alpha, heatmap_cv, alpha, 0)
        
        # Encode to B64
        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{jpg_as_text}"
        
    def _get_severity_details(self, pred_idx):
        details = {
            0: {"grade": 0, "color": "green", "desc": "Great news! Your retina appears completely normal with no signs of diabetic retinopathy. Consequence: No immediate action needed, just keep up with routine checkups."},
            1: {"grade": 1, "color": "yellow", "desc": "Tiny blood vessels in your eye are slightly bulging. Consequence: Your vision is likely fine now, but you need to strictly manage your blood sugar and get screened annually to prevent it from getting worse."},
            2: {"grade": 2, "color": "orange", "desc": "Blood vessels are increasingly blocked or leaking into the eye. Consequence: You are at higher risk for vision issues. You should schedule a visit with an eye specialist to evaluate if treatment is needed."},
            3: {"grade": 3, "color": "red", "desc": "Many blood vessels are blocked, drastically reducing blood supply to the retina. Consequence: High risk of permanent vision loss. Urgent specialist review and potential treatment are strongly recommended."},
            4: {"grade": 4, "color": "purple", "desc": "New, fragile blood vessels are growing and bleeding into the eye. Consequence: This is an advanced critical stage with severe risk of blindness. Immediate medical intervention or surgery is required."},
            5: {"grade": 3, "color": "red", "desc": "Signs of fluid pressure building up in the eye, damaging the optic nerve. Consequence: This can cause gradual loss of peripheral (side) vision. Urgent treatment is needed to halt the progression."},
            6: {"grade": 3, "color": "red", "desc": "Wear and tear on the central part of your retina (the macula). Consequence: Can lead to blurred or reduced central vision, making it difficult to read or recognize faces. A specialist needs to review it immediately."},
            7: {"grade": 0, "color": "green", "desc": "Your eye structure looks very healthy overall. Consequence: No abnormalities detected. Maintain a healthy lifestyle and continue routine eye exams."}
        }
        return details.get(pred_idx, {"grade": 0, "color": "gray", "desc": "Analysis complete."})

# Global instance for API
demo_model_instance = DemoModel()
