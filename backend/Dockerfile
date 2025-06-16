FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    build-essential \
    python3-dev \
    swig \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies in specific order
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir wheel setuptools && \
    pip install --no-cache-dir numpy==1.24.3 && \
    pip install --no-cache-dir opencv-python-headless==4.8.1.78 && \
    pip install --no-cache-dir -r requirements.txt && \
 

# Install PaddleOCR with specific versions
RUN pip install --no-cache-dir "paddlepaddle>=2.5.0" && \
    pip install --no-cache-dir "paddleocr==2.7.0.3"

# Copy the rest of the application
COPY . .

# Set Python path and environment variables
ENV PYTHONPATH=/app
ENV PYTHONASYNCIODEBUG=1

# Expose the port
EXPOSE 8080

# Command to run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--reload", "--workers", "1"] 