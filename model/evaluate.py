import torch
from torch.utils.data import DataLoader
from network import RetinalModel
from preprocessing import get_valid_transforms
from train import RetinalDataset
import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix, roc_auc_score, cohen_kappa_score
import numpy as np

def evaluate_model(model_path, data_dir, csv_path):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    # Load Model
    model = RetinalModel(num_classes=5, pretrained=False)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()

    # Load Data
    df = pd.read_csv(csv_path)
    dataset = RetinalDataset(df, data_dir, transforms=get_valid_transforms())
    dataloader = DataLoader(dataset, batch_size=16, shuffle=False)

    all_preds = []
    all_labels = []
    all_probs = []

    with torch.no_grad():
        for images, labels in dataloader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            preds = torch.argmax(outputs, dim=1)
            
            all_probs.extend(probs.cpu().numpy())
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())

    # Calculate Metrics
    acc = accuracy_score(all_labels, all_preds)
    qwk = cohen_kappa_score(all_labels, all_preds, weights='quadratic')
    conf_matrix = confusion_matrix(all_labels, all_preds)
    
    # Calculate AUC-ROC
    all_labels_bin = pd.get_dummies(all_labels).values
    try:
        auc = roc_auc_score(all_labels_bin, all_probs, multi_class='ovr')
    except:
        auc = "N/A"
        
    print(f"Accuracy: {acc:.4f}")
    print(f"Quadratic Weighted Kappa (QWK): {qwk:.4f}")
    print(f"AUC-ROC: {auc}")
    print("Confusion Matrix:")
    print(conf_matrix)

if __name__ == '__main__':
    # example usage
    # evaluate_model('../weights/efficientnet_b4_best.pth', '../data/raw', '../data/test.csv')
    print("Evaluation script ready.")
