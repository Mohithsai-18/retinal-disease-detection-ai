from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os
import uuid
import datetime

router = APIRouter()

REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

def create_pdf_report(data: dict, filepath: str):
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=20,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor("#14b8a6"),
        spaceAfter=15
    )
    
    normal_style = styles['Normal']
    
    elements = []
    
    # Header
    elements.append(Paragraph("Diagnostic AI Report: Retinal Analysis", title_style))
    elements.append(Paragraph(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
    elements.append(Spacer(1, 20))
    
    # Diagnosis Section
    elements.append(Paragraph("AI Diagnosis Summary", subtitle_style))
    
    data_list = [
        ["Primary Diagnosis", data.get('prediction', 'N/A')],
        ["Confidence Score", f"{data.get('confidence', 0)*100:.1f}%"],
        ["Severity Grade", str(data.get('severity_details', {}).get('grade', 'N/A'))],
        ["Description", data.get('severity_details', {}).get('desc', 'N/A')]
    ]
    
    t = Table(data_list, colWidths=[150, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f1f5f9")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#334155")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1"))
    ]))
    
    elements.append(t)
    elements.append(Spacer(1, 30))
    
    # Render Grad-CAM Heatmap if available
    if data.get("heatmap_base64"):
        try:
            import base64
            import tempfile
            from reportlab.platypus import KeepTogether
            
            # The base64 string from frontend/API usually contains the 'data:image/jpeg;base64,' prefix
            b64_data = data.get("heatmap_base64")
            if "base64," in b64_data:
                b64_data = b64_data.split("base64,")[1]
                
            img_bytes = base64.b64decode(b64_data)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
                tmp_file.write(img_bytes)
                tmp_file_path = tmp_file.name
                
            heatmap_img = Image(tmp_file_path, width=300, height=300)
            
            heatmap_section = []
            heatmap_section.append(Paragraph("AI Interpretability (Grad-CAM Heatmap)", subtitle_style))
            heatmap_section.append(heatmap_img)
            heatmap_section.append(Spacer(1, 20))
            
            elements.append(KeepTogether(heatmap_section))
        except Exception as e:
            print(f"Error embedding heatmap: {e}")
            
    elements.append(Paragraph("Disclaimer: This tool is intended to aid clinicians and is not a substitute for professional medical judgment.", styles['Italic']))
    
    doc.build(elements)
    
    # Try to clean up temp files if created
    if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
        try:
            os.remove(tmp_file_path)
        except:
            pass

def create_comparison_pdf_report(data: dict, filepath: str):
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('MainTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor("#0f172a"), spaceAfter=20, alignment=1)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor("#14b8a6"), spaceAfter=15)
    normal_style = styles['Normal']
    
    elements = []
    
    # Header
    elements.append(Paragraph("Longitudinal Comparison Report", title_style))
    elements.append(Paragraph(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
    elements.append(Spacer(1, 20))
    
    # Overview
    elements.append(Paragraph("Progression Analysis", subtitle_style))
    
    progression = data.get('severity_progression', {})
    metrics = data.get('metrics', {})
    
    data_list = [
        ["Baseline Diagnosis", progression.get('baseline', 'N/A')],
        ["Current Diagnosis", progression.get('current', 'N/A')],
        ["Status", "Worsened" if progression.get('worsened') else "Stable/Improved"]
    ]
    
    t = Table(data_list, colWidths=[150, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f1f5f9")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#334155")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1"))
    ]))
    
    elements.append(t)
    elements.append(Spacer(1, 20))
    
    # Clinical Assessment
    elements.append(Paragraph("Clinical Assessment", subtitle_style))
    elements.append(Paragraph(data.get('clinical_assessment', 'No assessment provided.'), normal_style))
    elements.append(Spacer(1, 20))
    
    # Metrics
    elements.append(Paragraph("Detailed Metrics", subtitle_style))
    metrics_list = [["Metric", "Baseline", "Current", "Change"]]
    for key, val in metrics.items():
        change = val.get('change_pct', str(val.get('worsened', '')))
        if isinstance(change, int) or isinstance(change, float):
            change = f"{change}%"
            
        metrics_list.append([
            val.get('name', key),
            str(val.get('baseline', '')),
            str(val.get('current', '')),
            change
        ])
        
    t_metrics = Table(metrics_list, colWidths=[150, 100, 100, 100])
    t_metrics.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#334155")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1"))
    ]))
    
    elements.append(t_metrics)
    elements.append(Spacer(1, 30))
    
    elements.append(Paragraph("Disclaimer: This tool is intended to aid clinicians. Not a substitute for professional medical judgment.", styles['Italic']))
    
    doc.build(elements)

@router.post("/generate", summary="Generate a PDF report for a diagnostic result")
async def generate_report(data: dict):
    filename = f"report_{uuid.uuid4().hex[:8]}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)
    
    create_pdf_report(data, filepath)
    
    return {"report_url": f"/api/report/download/{filename}"}

@router.post("/generate/compare", summary="Generate a PDF report for longitudinal comparison")
async def generate_compare_report(data: dict):
    filename = f"compare_{uuid.uuid4().hex[:8]}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)
    
    create_comparison_pdf_report(data, filepath)
    
    return {"report_url": f"/api/report/download/{filename}"}

@router.get("/download/{filename}")
async def download_report(filename: str):
    filepath = os.path.join(REPORTS_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type='application/pdf', filename=filename)
    return {"error": "Report not found"}
