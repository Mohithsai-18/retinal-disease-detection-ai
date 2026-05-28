import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from network import RetinalModel
from preprocessing import get_train_transforms, get_valid_transforms, preprocess_image
import os
import cv2
import pandas as pd
from sklearn.metrics import cohen_kappa_score
import time
from tqdm import tqdm

class RetinalDataset(Dataset):
    def __init__(self, df, img_dir, transforms=None):
        self.df = df
        self.img_dir = img_dir
        self.transforms = transforms

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        img_id = self.df.iloc[idx]['id_code']
        # Handle different datasets which might have different extensions
        img_path_png = os.path.join(self.img_dir, f"{img_id}.png")
        img_path_jpg = os.path.join(self.img_dir, f"{img_id}.jpg")
        
        if os.path.exists(img_path_png):
            img_path = img_path_png
        else:
            img_path = img_path_jpg
            
        # For real training, we should pre-process and save to avoid doing it every epoch.
        # Here we just read and apply albumentations.
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        if self.transforms:
            # No need for dictionary return like albumentations
            image = self.transforms(image)

        label = torch.tensor(self.df.iloc[idx]['diagnosis'], dtype=torch.long)
        return image, label

def train_epoch(model, dataloader, optimizer, criterion, device, scaler, scheduler):
    model.train()
    running_loss = 0.0
    progress_bar = tqdm(dataloader, desc="Training")
    
    for images, labels in progress_bar:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        # Mixed Precision
        if device == 'cuda':
            with torch.cuda.amp.autocast():
                outputs = model(images)
                loss = criterion(outputs, labels)
            
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
        scheduler.step()

        running_loss += loss.item()
        progress_bar.set_postfix({'loss': loss.item()})

    return running_loss / len(dataloader)

def evaluate_epoch(model, dataloader, criterion, device):
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_labels = []

    with torch.no_grad():
        for images, labels in tqdm(dataloader, desc="Validating"):
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)
            running_loss += loss.item()

            preds = torch.argmax(outputs, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    qwk = cohen_kappa_score(all_labels, all_preds, weights='quadratic')
    return running_loss / len(dataloader), qwk

def main():
    # Configuration
    DATA_DIR = '../data/raw'
    TRAIN_CSV = '../data/train.csv' # Assuming you put train.csv from Kaggle here
    BATCH_SIZE = 2
    EPOCHS = 1
    LR = 3e-4
    DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    print(f"Using device: {DEVICE}")

    # Check if data exists
    if not os.path.exists(TRAIN_CSV):
        print("Demo: Training script ready. Please place APTOS 2019 dataset in data/raw.")
        print(f"Missing: {TRAIN_CSV}")
        return

    # Load data
    df = pd.read_csv(TRAIN_CSV)
    
    # Stratified Split (simplified)
    from sklearn.model_selection import train_test_split
    train_df, valid_df = train_test_split(df, test_size=0.2, stratify=df['diagnosis'], random_state=42)

    train_dataset = RetinalDataset(train_df, DATA_DIR, transforms=get_train_transforms())
    valid_dataset = RetinalDataset(valid_df, DATA_DIR, transforms=get_valid_transforms())

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    valid_loader = DataLoader(valid_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # Calculate class weights for imbalanced data
    class_counts = train_df['diagnosis'].value_counts().sort_index().values
    weights = 1. / class_counts
    weights = weights / weights.sum()
    class_weights = torch.FloatTensor(weights).to(DEVICE)

    # Initialize model
    model = RetinalModel(num_classes=5).to(DEVICE) # APTOS is 5 classes
    
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.OneCycleLR(optimizer, max_lr=LR, steps_per_epoch=len(train_loader), epochs=EPOCHS)
    scaler = torch.cuda.amp.GradScaler() if DEVICE == 'cuda' else None

    best_qwk = -1
    
    for epoch in range(EPOCHS):
        print(f"\\nEpoch {epoch+1}/{EPOCHS}")
        
        train_loss = train_epoch(model, train_loader, optimizer, criterion, DEVICE, scaler, scheduler)
        val_loss, qwk = evaluate_epoch(model, valid_loader, criterion, DEVICE)
        
        print(f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | QWK: {qwk:.4f}")
        
        if qwk > best_qwk:
            best_qwk = qwk
            torch.save(model.state_dict(), '../weights/efficientnet_b4_best.pth')
            print(f"Saved new best model with QWK: {best_qwk:.4f}")

if __name__ == '__main__':
    main()
