FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src/battery_forecaster.py .

COPY ./src/models/ ./models/

CMD ["python", "battery_forecaster.py"]
