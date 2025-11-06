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
# 確保 staticfiles 目錄存在，然後執行 collectstatic
# 使用 verbose 模式輸出 collectstatic 的詳細信息，方便調試
CMD ["sh", "-c", "mkdir -p /app/staticfiles && echo '=== Running migrations ===' && python manage.py migrate && echo '=== Collecting static files ===' && python manage.py collectstatic --noinput --clear --verbosity 2 && echo '=== Verifying static files ===' && ls -la /app/staticfiles/ | head -20 && echo '=== Checking admin static files ===' && ls -la /app/staticfiles/admin/ 2>/dev/null | head -10 || echo 'WARNING: /app/staticfiles/admin/ not found!' && echo '=== Starting server ===' && gunicorn pinelab.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --access-logfile - --error-logfile -"]

