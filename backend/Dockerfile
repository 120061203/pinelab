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

# Expose port
EXPOSE 8000

# Run migrations, collect static files, and start server
# 如果 collectstatic 失敗，只記錄警告但繼續啟動（避免服務無法啟動）
CMD ["sh", "-c", "python manage.py migrate && (python manage.py collectstatic --noinput || echo 'Warning: collectstatic failed, continuing anyway...') && gunicorn pinelab.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -"]

