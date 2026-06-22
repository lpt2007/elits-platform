FROM python:3.11-slim

RUN pip install psutil fastapi uvicorn requests docker

COPY main.py /app/main.py
COPY requirements.txt /app/requirements.txt

WORKDIR /app

EXPOSE 80

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
