# Retinal Disease Detection AI

A portfolio-grade AI diagnostics platform that uses deep learning (CNN) to detect diabetic retinopathy (5 severity grades), glaucoma, AMD, and normal retinal conditions from fundus images, incorporating explainable AI (Grad-CAM) overlays and a fluid, glassmorphic UI design.

---

## 🎨 Premium Visual Identity & UI Design

The platform features a visual interface designed to reflect a premium clinical workspace based on **Living Cells & Fluid Intelligence**:
* **Aesthetics**: Glassmorphism cards (`.glass-panel`) with blur filters, subtle teal borders, and dark slate backgrounds.
* **Micro-Animations**: A high-performance, GPU-accelerated HTML5 canvas animation rendering shifting organic gradients, deforming cell membranes, rising fluid bubbles, and floating medical crosses.
* **Typography**: Modern geometric fonts (Outfit and Inter) providing optimal readability for critical clinical readouts and charts.

> [!TIP]
> To explore all interface designs, mobile responsive views, and user flows, check out the detailed [Project Showcase Documentation](docs/project-showcase.md).

---

## 📸 Visual Showcase Gallery

### Clinician Dashboard Overview
![Clinician Dashboard](screenshots/dashboard-overview.png)

### Explainable AI Diagnostic Results & Grad-CAM
![Explainable AI Results](screenshots/analysis-results.png)

### Longitudinal Scan Comparison
![Longitudinal Scan Comparison](screenshots/compare-page.png)

---

## 🔬 Core Features

- **Multi-Disease Detection**: Classifies Diabetic Retinopathy (5 severity grades), Glaucoma, AMD, and Normal.
- **Explainable AI Integration**: Utilizes Grad-CAM to visualize the areas of the retina that influenced the AI's diagnosis.
- **Premium User Interface**: Built with React + Tailwind CSS v4, featuring glassmorphism design, animations, and longitudinal scan comparisons.
- **Automated Diagnostic Reports**: Generates professional PDF reports detailing patient diagnoses and findings.

---

## 🛠️ Technology Stack

- **Deep Learning Model**: EfficientNet-B4 (PyTorch+Timm) trained on APTOS 2019 dataset.
- **Explainability**: `pytorch-grad-cam`
- **Preprocessing Engine**: OpenCV & Albumentations (CLAHE, Border Cropping)
- **Backend API**: FastAPI + SQLAlchemy + SQLite
- **Frontend Dashboard**: React + Vite + Tailwind CSS v4 + Framer Motion
- **Containerization**: Docker & Docker Compose

---

## 🚀 Quick Start (Demo Mode)

Since the original dataset is large and requires a GPU to train, the project is configured with a **"Simulation Model"** for immediate testing of the full stack without needing any PyTorch weights.

### Using Docker (Simplest Method)

1. Clone or open the repository.
2. Run Docker Compose:
```bash
docker-compose up --build
```
3. Access the dashboard at `http://localhost:5173`

*(Note: In Simulation Mode, any image uploaded will generate a mock realistic prediction and a synthetic heatmap for demonstration.)*

### Running Locally (Without Docker)

If you don't have Docker installed or running:

1. **Start the FastAPI Backend**:
   Ensure Python dependencies from `requirements.txt` are installed, set the `PYTHONPATH` to `api`, and start the uvicorn server:
   ```bash
   # Windows PowerShell
   $env:PYTHONPATH="api"
   python -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```
2. **Start the Vite Frontend**:
   Install Node packages and run the development script:
   ```bash
   cd frontend
   npm install
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
3. Access the dashboard at `http://127.0.0.1:5173`

---

## 🏋️ Training the Model (Production Mode)

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

---

## 📂 Directory Structure

- `/api` - FastAPI backend logic, routing, schemas, DB.
- `/model` - PyTorch model architecture, training loops, preprocessing, and Grad-CAM code.
- `/frontend` - React application source code.
- `/data` - Placeholder directory for Kaggle dataset.
- `/reports` / `/uploads` - Runtime file storage.
- `/screenshots` - High-resolution screenshot gallery.

---

## 📈 Evaluation Metrics

The evaluation script (`model/evaluate.py`) computes:
- Accuracy
- Quadratic Weighted Kappa (QWK) - Standard metric for Diabetic Retinopathy
- Sensitivity & Specificity
- Multi-class AUC-ROC
- Confusion Matrix
