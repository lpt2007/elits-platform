FROM python:3.11-slim

# Namesti nvidia-smi če je na voljo
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN pip install psutil fastapi uvicorn requests docker

COPY main.py /app/main.py
COPY requirements.txt /app/requirements.txt

WORKDIR /app

EXPOSE 80

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
