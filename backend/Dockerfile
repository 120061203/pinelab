FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set Python path
ENV PYTHONPATH=/app/src

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install gunicorn for production
RUN pip install --no-cache-dir gunicorn

# Copy application code
COPY . .

# Collect static files during build (better than at runtime)
# 在構建階段收集靜態文件，這樣可以永久包含在 Docker 鏡像中
RUN mkdir -p /app/staticfiles && python manage.py collectstatic --noinput --verbosity 2

# Expose port
EXPOSE 8000

# Run migrations and start server
# 靜態文件已經在構建時收集，這裡只需要運行遷移和啟動服務
CMD ["sh", "-c", "echo '=== Running migrations ===' && python manage.py migrate && echo '=== Starting server ===' && gunicorn pinelab.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -"]

