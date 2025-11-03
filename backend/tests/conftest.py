"""
Pytest 配置與共用 Fixtures
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    """
    提供 API 測試客戶端
    """
    return APIClient()


@pytest.fixture
def admin_user():
    """
    建立測試用管理員使用者
    """
    return User.objects.create_user(
        username='admin',
        email='admin@pinelab.test',
        password='testpassword123',
        is_staff=True,
        is_superuser=True
    )


@pytest.fixture
def authenticated_client(api_client, admin_user):
    """
    提供已認證的 API 客戶端
    """
    api_client.force_authenticate(user=admin_user)
    return api_client

