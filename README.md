# Albanian Invoice Processor

A web application for processing Albanian invoices using OCR technology. The application extracts structured data from invoice images and presents it in a user-friendly format.

## Features

- Upload and process invoice images
- Extract text using Tesseract OCR with Albanian language support
- Parse invoice data into structured format
- Display results in a clean, tabular interface
- Real-time processing status updates

## Tech Stack

### Backend
- Python 3.x
- FastAPI
- Tesseract OCR
- OpenCV
- NumPy
- Pillow

### Frontend
- React
- Material-UI
- Axios

## Installation

### Prerequisites
- Python 3.x
- Node.js and npm
- Tesseract OCR with Albanian language support

### Backend Setup

1. Create a virtual environment and activate it:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Usage

1. Open the application in your web browser
2. Click the "Upload Invoice" button
3. Select an invoice image file
4. Wait for the processing to complete
5. View the extracted data in the table format

## Development

### Project Structure
```
albanian-invoice-processor/
├── backend/
│   ├── venv/
│   ├── tessdata/
│   ├── requirements.txt
│   └── main.py
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UploadForm.js
    │   │   └── InvoiceDisplay.js
    │   └── App.js
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
