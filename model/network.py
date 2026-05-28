import torch
import torch.nn as nn
import timm

class RetinalModel(nn.Module):
    def __init__(self, num_classes=8, pretrained=True):
        super(RetinalModel, self).__init__()
        # Use EfficientNet-B4 as the backbone
        self.backbone = timm.create_model('efficientnet_b4', pretrained=pretrained, num_classes=0) # num_classes=0 means drop the classifier
        
        # Get the number of input features for the classifier
        in_features = self.backbone.num_features
        
        # Custom classifier head
        # Classes: DR 0-4 (5), Glaucoma (1), AMD (1), Normal (1) = Total 8
        self.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        features = self.backbone(x)
        output = self.classifier(features)
        return output
        
    def get_cam_layer(self):
        # Target the last convolutional block for Grad-CAM
        return self.backbone.conv_head

def load_model(weights_path=None, device='cpu', num_classes=8):
    model = RetinalModel(num_classes=num_classes, pretrained=False)
    if weights_path:
        try:
            state_dict = torch.load(weights_path, map_location=device)
            model.load_state_dict(state_dict)
            print(f"Loaded weights from {weights_path}")
        except Exception as e:
            print(f"Warning: Could not load weights from {weights_path}: {e}")
            print("Using initialized weights.")
    
    model = model.to(device)
    model.eval()
    return model

if __name__ == "__main__":
    # Test model instantiation
    model = RetinalModel(num_classes=8)
    dummy_input = torch.randn(2, 3, 380, 380) # Batch size 2, 3 channels, 380x380 resolution
    output = model(dummy_input)
    print(f"Output shape: {output.shape}") # Should be [2, 8]
    print(f"CAM layer: {model.get_cam_layer()}")
