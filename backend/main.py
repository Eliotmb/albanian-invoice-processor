from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import io
import easyocr
import re

import json
import sys
import os
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Albanian Invoice OCR API",
    description="API for processing Albanian invoices using EasyOCR",
    version="1.0.0"
)

# Initialize EasyOCR with Albanian and English
reader = easyocr.Reader(['sq', 'en'])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add root endpoint
@app.get("/")
async def root():
    return {"message": "Albanian Invoice OCR API is running (EasyOCR)"}

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error handler caught: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

def extract_description_price_pairs(ocr_text):
    pairs = []
    for line in ocr_text.splitlines():
        # Regex: price at end of line (e.g. 123.45 or 1,234.56 or 123)
        match = re.search(r'([0-9]+(?:[.,][0-9]{2})?)\s*$', line)
        if match:
            price = match.group(1)
            description = line[:match.start()].strip(" .:-\t")
            if description and price:
                pairs.append({"description": description, "price": price})
    return pairs

def extract_invoice_totals(ocr_text):
    totals = {}
    # Patterns to match (add more variants if needed)
    patterns = [
        (r"totali[\s\-]*i[\s\-]*fatur[ëeës]+", "Totali i faturës"),
        (r"totali[\s\-]*n[ëe][\s\-]*euro", "Totali në euro"),
        (r"total", "Total"),  # Add English 'total' as a catch-all
    ]
    for line in ocr_text.lower().splitlines():
        for pattern, label in patterns:
            if re.search(pattern, line):
                # Find the last number in the line (price)
                match = re.search(r"([0-9]+(?:[.,][0-9]{2,})?)\s*$", line)
                if match:
                    totals[label] = match.group(1)
    return totals

@app.post("/api/process-invoice/")
async def process_invoice(file: UploadFile = File(...)):
    try:
        logger.info("Starting to process invoice...")
        contents = await file.read()
        logger.info("File read complete, size: %d bytes", len(contents))
        
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        logger.info("Image loaded and converted to RGB")
        
        np_image = np.array(image)
        logger.info("Image converted to numpy array, shape: %s", np_image.shape)
        
        logger.info("Starting OCR processing...")
        result = reader.readtext(np_image)
        logger.info("OCR processing complete, found %d text regions", len(result))
        
        ocr_text = '\n'.join([line[1] for line in result])
        logger.info("Text extraction complete")
        
        pairs = extract_description_price_pairs(ocr_text)
        logger.info("Extracted %d description-price pairs", len(pairs))
        
        totals = extract_invoice_totals(ocr_text)
        logger.info("Extracted totals: %s", totals)
        
        return {"text": ocr_text, "extracted_data": {"pairs": pairs, "totals": totals}}
    except Exception as e:
        logger.error("OCR processing failed: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server...")
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=3001,
        reload=False,
        log_level="debug",
        lifespan="on"
    )
