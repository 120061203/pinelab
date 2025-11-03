"""
認證 URLs
"""
from django.urls import path
from .views import login, logout

urlpatterns = [
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
]

