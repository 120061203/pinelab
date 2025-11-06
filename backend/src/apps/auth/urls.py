"""
認證 URLs
"""
from django.urls import path
from .views import (
    login, logout,
    password_reset_request, password_reset_confirm, change_password
)

urlpatterns = [
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/password-reset-request/', password_reset_request, name='password-reset-request'),
    path('auth/password-reset-confirm/', password_reset_confirm, name='password-reset-confirm'),
    path('auth/change-password/', change_password, name='change-password'),
]

