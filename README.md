# Retinal Disease Detection AI

A portfolio-grade AI project that uses deep learning (CNN) to detect diabetic retinopathy and other retinal conditions from fundus images.

## Features

- **Multi-Disease Detection**: Classifies Diabetic Retinopathy (5 severity grades), Glaucoma, AMD, and Normal.
- **Explainable AI Integration**: Utilizes Grad-CAM to visualize the areas of the retina that influenced the AI's diagnosis.
- **Premium User Interface**: Built with React + Tailwind CSS, featuring glassmorphism design, animations, and longitudinal scan comparisons.
- **Automated Diagnostic Reports**: Generates professional PDF reports detailing patient diagnoses and findings.

## Technology Stack

- **Deep Learning Model**: EfficientNet-B4 (PyTorch+Timm) trained on APTOS 2019 dataset.
- **Explainability**: `pytorch-grad-cam`
- **Preprocessing Engine**: OpenCV & Albumentations (CLAHE, Border Cropping)
- **Backend API**: FastAPI + SQLAlchemy + SQLite
- **Frontend Dashboard**: React + Vite + Tailwind CSS v4 + Framer Motion
- **Containerization**: Docker & Docker Compose

## Quick Start (Demo Mode)

Since the original dataset is large and requires a GPU to train, the project is configured with a **"Simulation Model"** for immediate testing of the full stack without needing any PyTorch weights.

### Using Docker (Simplest Method)

1. Clone or open the repository.
2. Run Docker Compose:
```bash
docker-compose up --build
```
3. Access the dashboard at `http://localhost:5173`

*(Note: In Simulation Mode, any image uploaded will generate a mock realistic prediction and a synthetic heatmap for demonstration.)*

## Training the Model (Production Mode)

To train the actual deep learning model on your own hardware (NVIDIA GPU recommended):

1. Download the [APTOS 2019 Blindness Detection Dataset](https://www.kaggle.com/c/aptos2019-blindness-detection/data) from Kaggle.
2. Extract the dataset into `data/raw/` and place `train.csv` in `data/`.
3. Install dependencies: `pip install -r requirements.txt`
4. Run the training script:
```bash
cd model
python train.py
```
5. Once trained, modify `api/predict.py` to import `load_model` from `model.network` instead of the `demo_model`.

## Directory Structure

- `/api` - FastAPI backend logic, routing, schemas, DB.
- `/model` - PyTorch model architecture, training loops, preprocessing, and Grad-CAM code.
- `/frontend` - React application source code.
- `/data` - Placeholder directory for Kaggle dataset.
- `/reports` / `/uploads` - Runtime file storage.

## Evaluation Metrics

The evaluation script (`model/evaluate.py`) computes:
- Accuracy
- Quadratic Weighted Kappa (QWK) - Standard metric for Diabetic Retinopathy
- Sensitivity & Specificity
- Multi-class AUC-ROC
- Confusion Matrix
