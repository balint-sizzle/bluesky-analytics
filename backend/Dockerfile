# Use Python as the base image
FROM python:3.12-alpine
WORKDIR /app
# ENV FLASK_APP=app.py
# ENV FLASK_RUN_HOST=0.0.0.0
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
# Run the application
CMD ["python", "app.py"]