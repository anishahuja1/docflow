import json
import csv
import io
from fastapi.responses import StreamingResponse
from app.models.document import Document

class ExportService:
    @staticmethod
    def export_json(doc: Document):
        data = doc.reviewed_data or doc.extracted_data or {}
        buffer = io.StringIO()
        json.dump(data, buffer, indent=2)
        buffer.seek(0)
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue().encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={doc.original_filename}.json"}
        )

    @staticmethod
    def export_csv(doc: Document):
        data = doc.reviewed_data or doc.extracted_data or {}
        
        # Flatten logic as requested: "field" and "value" columns
        rows = []
        
        def flatten(d, prefix=''):
            for k, v in d.items():
                key = f"{prefix}.{k}" if prefix else k
                if isinstance(v, dict):
                    flatten(v, key)
                elif isinstance(v, list):
                    rows.append({"field": key, "value": ", ".join(map(str, v))})
                else:
                    rows.append({"field": key, "value": str(v)})
        
        flatten(data)
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["field", "value"])
        writer.writeheader()
        writer.writerows(rows)
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={doc.original_filename}.csv"}
        )
