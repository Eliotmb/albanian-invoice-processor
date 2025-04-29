from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import cv2
import numpy as np
import io
from typing import List, Dict
import preprocess
import json
import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configure Tesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
TESSDATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tessdata')
os.environ['TESSDATA_PREFIX'] = TESSDATA_DIR

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(image_bytes):
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        logger.debug(f"Image opened successfully. Size: {image.size}, Mode: {image.mode}")
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
            logger.debug("Converted image to RGB mode")
        
        # Convert to OpenCV format
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        logger.debug("Converted to OpenCV format")

        preprocessed_image = preprocess.preprocess(cv_image)
        logger.debug("Preprocessed image")

        # Convert back to PIL Image
        return Image.fromarray(cv2.cvtColor(preprocessed_image, cv2.COLOR_BGR2RGB))
    except Exception as e:
        logger.error(f"Error in preprocess_image: {str(e)}", exc_info=True)
        raise

def extract_table_data(text: str) -> List[Dict]:
    """Extract structured data from the invoice text"""
    try:
        lines = text.split('\n')
        items = []
        current_item = {}
        header_found = False
        
        # Define header keywords
        headers = {
            'nr_kartele': ['nr kartele', 'nrkartele', 'nr.kartele'],
            'pershkrimi': ['pershkrimi', 'pershkrim', 'përshkrimi'],
            'njesia': ['njesia', 'njësia', 'nj'],
            'sasia': ['sasia', 'sasi'],
            'cmimi': ['cmimi', 'çmimi'],
            'vlera_pa_tvsh': ['vlera pa tvsh', 'pa tvsh'],
            'tvsh': ['tvsh', 't.v.sh'],
            'vlera_me_tvsh': ['vlera me tvsh', 'me tvsh']
        }
        
        logger.debug("\nProcessing lines:")
        for line in lines:
            line = line.strip().lower()
            if not line:
                continue
                
            logger.debug(f"Processing line: {line}")
            
            # Check if this is a header line
            header_matches = 0
            for header_key, header_variants in headers.items():
                if any(variant in line for variant in header_variants):
                    header_matches += 1
                    logger.debug(f"Found header match: {header_key}")
            
            if header_matches >= 3:  # If we find at least 3 headers
                logger.debug("Header line found!")
                header_found = True
                if current_item:
                    items.append(current_item)
                    current_item = {}
                continue
            
            if header_found:
                # Split line into words
                words = line.split()
                if len(words) >= 4:  # Assume we need at least 4 words for a valid item line
                    try:
                        # Try to extract numeric values
                        numbers = [float(word.replace(',', '.')) for word in words if word.replace(',', '.').replace('.', '').isdigit()]
                        if len(numbers) >= 3:  # If we found at least 3 numbers
                            logger.debug(f"Found item line with numbers: {numbers}")
                            current_item = {
                                'nr_kartele': words[0] if len(words) > 0 else '',
                                'pershkrimi': ' '.join(words[1:-6]) if len(words) > 6 else '',
                                'njesia': words[-6] if len(words) > 6 else '',
                                'sasia': numbers[0] if len(numbers) > 0 else None,
                                'cmimi': numbers[1] if len(numbers) > 1 else None,
                                'vlera_pa_tvsh': numbers[2] if len(numbers) > 2 else None,
                                'tvsh': numbers[3] if len(numbers) > 3 else None,
                                'vlera_me_tvsh': numbers[4] if len(numbers) > 4 else None
                            }
                            items.append(current_item)
                            current_item = {}
                            logger.debug(f"Added item: {current_item}")
                    except (ValueError, IndexError) as e:
                        logger.error(f"Error processing line: {e}")
                        continue
        
        # Add the last item if exists
        if current_item:
            items.append(current_item)
        
        logger.debug(f"\nExtracted {len(items)} items")
        return items
    except Exception as e:
        logger.error(f"Error in extract_table_data: {str(e)}", exc_info=True)
        raise

@app.post("/api/process-invoice/")
async def process_invoice(file: UploadFile = File(...)):
    logger.info("\n=== Starting Invoice Processing ===")
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        logger.info(f"Received file: {file.filename}")
        contents = await file.read()
        logger.info(f"File size: {len(contents)} bytes")
        
        # Preprocess the image
        logger.info("Preprocessing image...")
        processed_image = preprocess_image(contents)
        logger.info("Image preprocessing complete")
        
        # Extract text using Tesseract
        logger.info("Extracting text with Tesseract...")
        text = pytesseract.image_to_string(processed_image, lang='sqi+eng')
        logger.info("\nExtracted text:")
        logger.info(text)
        
        # Extract structured data
        logger.info("\nExtracting structured data...")
        items = extract_table_data(text)
        
        # Prepare response
        response_data = {
            "items": items,
            "raw_text": text
        }
        
        logger.info("\n=== Processing Complete ===")
        return response_data
        
    except Exception as e:
        logger.error(f"\nError: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting server...")
    logger.info(f"Tesseract version: {pytesseract.get_tesseract_version()}")
    logger.info(f"Available languages: {pytesseract.get_languages()}")
    logger.info(f"Using tessdata directory: {TESSDATA_DIR}")
    uvicorn.run(app, host="0.0.0.0", port=8080)
