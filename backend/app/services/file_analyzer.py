import io
import base64
from typing import Dict, Any, List, Optional
import pandas as pd
from pypdf import PdfReader
from PIL import Image
from ..schemas.copilot_schemas import FileEvidenceItem, FileAnalysisResponse

class FileAnalyzer:
    """Parses and structures multimodal user uploads for Gemini AI context ingestion."""

    @staticmethod
    def analyze_image_bytes(file_name: str, file_bytes: bytes, mime_type: str = "image/jpeg") -> FileEvidenceItem:
        """Inspect image file and encode for Gemini Multimodal Vision."""
        try:
            image = Image.open(io.BytesIO(file_bytes))
            width, height = image.size
            img_format = image.format or "JPEG"
            b64_str = base64.b64encode(file_bytes).decode('utf-8')
            
            summary = (
                f"📷 Uploaded Image: '{file_name}' ({width}x{height} px, {img_format}). "
                f"Visual inspection ready for structural distress, slope shear cracks, and retaining wall examination."
            )

            return FileEvidenceItem(
                file_name=file_name,
                file_type=f"image/{img_format.lower()}",
                file_size_bytes=len(file_bytes),
                extracted_summary=summary,
                data_preview=f"Image dimensions: {width}x{height} pixels | Format: {img_format}",
                is_image=True,
                is_pdf=False,
                is_tabular=False,
                image_base64=b64_str
            )
        except Exception as e:
            return FileEvidenceItem(
                file_name=file_name,
                file_type="image/unknown",
                file_size_bytes=len(file_bytes),
                extracted_summary=f"Error reading image: {str(e)}",
                is_image=True,
                is_pdf=False,
                is_tabular=False
            )

    @staticmethod
    def analyze_pdf_bytes(file_name: str, file_bytes: bytes) -> FileEvidenceItem:
        """Extract text and risk telemetry from PDF reports."""
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            num_pages = len(reader.pages)
            extracted_text = []

            for idx, page in enumerate(reader.pages[:10]): # Cap at 10 pages for concise context
                text = page.extract_text()
                if text:
                    extracted_text.append(f"--- Page {idx+1} ---\n{text.strip()}")

            full_text = "\n\n".join(extracted_text)
            char_count = len(full_text)

            # Extract key domain indicators
            keywords = ["landslide", "flood", "rainfall", "slope", "evacuation", "geotechnical", "ksdma", "hazard", "shelter", "pore pressure"]
            found_keywords = [kw for kw in keywords if kw in full_text.lower()]

            preview = full_text[:1200] + ("..." if len(full_text) > 1200 else "")
            summary = (
                f"📄 Uploaded PDF: '{file_name}' ({num_pages} pages, {char_count} chars). "
                f"Detected themes: {', '.join(found_keywords) if found_keywords else 'General Technical Report'}."
            )

            return FileEvidenceItem(
                file_name=file_name,
                file_type="application/pdf",
                file_size_bytes=len(file_bytes),
                extracted_summary=summary,
                data_preview=preview,
                is_image=False,
                is_pdf=True,
                is_tabular=False
            )
        except Exception as e:
            return FileEvidenceItem(
                file_name=file_name,
                file_type="application/pdf",
                file_size_bytes=len(file_bytes),
                extracted_summary=f"PDF parsing error: {str(e)}",
                is_image=False,
                is_pdf=True,
                is_tabular=False
            )

    @staticmethod
    def analyze_tabular_bytes(file_name: str, file_bytes: bytes, is_excel: bool = False) -> FileEvidenceItem:
        """Parse and summarize CSV or Excel spreadsheet."""
        try:
            if is_excel:
                df = pd.read_excel(io.BytesIO(file_bytes))
            else:
                # Try UTF-8 and fallback encoding
                try:
                    df = pd.read_csv(io.BytesIO(file_bytes), encoding='utf-8')
                except UnicodeDecodeError:
                    df = pd.read_csv(io.BytesIO(file_bytes), encoding='latin-1')

            rows, cols = df.shape
            col_names = df.columns.tolist()

            # Generate clean markdown table for top 5 rows without external tabulate dependency
            cols_str = [str(c) for c in col_names]
            header = "| " + " | ".join(cols_str) + " |"
            sep = "| " + " | ".join(["---"] * len(cols_str)) + " |"
            row_lines = []
            for _, r in df.head(6).iterrows():
                row_lines.append("| " + " | ".join(str(v) for v in r.values) + " |")
            top_rows_md = "\n".join([header, sep] + row_lines)

            # Compute summary stats for numerical columns
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            stats_summary = []
            for col in numeric_cols[:6]:
                col_max = df[col].max()
                col_min = df[col].min()
                col_mean = df[col].mean()
                stats_summary.append(f"{col}: [Min: {col_min:.1f}, Avg: {col_mean:.1f}, Max: {col_max:.1f}]")

            stats_str = " | ".join(stats_summary) if stats_summary else "Non-numerical dataset."

            summary = (
                f"📊 Uploaded Table: '{file_name}' ({rows} rows, {cols} columns: {', '.join(str(c) for c in col_names[:6])}). "
                f"Summary: {stats_str}"
            )

            preview = f"### Table Preview (Top rows):\n{top_rows_md}\n\n### Statistical Aggregates:\n{stats_str}"

            return FileEvidenceItem(
                file_name=file_name,
                file_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if is_excel else "text/csv",
                file_size_bytes=len(file_bytes),
                extracted_summary=summary,
                data_preview=preview,
                is_image=False,
                is_pdf=False,
                is_tabular=True
            )
        except Exception as e:
            return FileEvidenceItem(
                file_name=file_name,
                file_type="text/csv",
                file_size_bytes=len(file_bytes),
                extracted_summary=f"Tabular parsing error: {str(e)}",
                data_preview=f"Error reading tabular data: {str(e)}",
                is_image=False,
                is_pdf=False,
                is_tabular=True
            )

file_analyzer = FileAnalyzer()
