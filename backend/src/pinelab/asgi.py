"""
ASGI config for pinelab project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pinelab.settings')

application = get_asgi_application()

