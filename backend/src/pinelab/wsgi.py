"""
WSGI config for pinelab project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pinelab.settings')

application = get_wsgi_application()

