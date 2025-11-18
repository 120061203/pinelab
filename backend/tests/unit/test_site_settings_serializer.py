"""
SiteSettings, News, Service Serializer 單元測試
"""
import pytest
from datetime import date
from apps.site_settings.models import SiteSettings, News, Service
from apps.site_settings.serializers import (
    SiteSettingsSerializer,
    NewsSerializer,
    ServiceSerializer
)
from apps.site_settings.admin_serializers import (
    SiteSettingsAdminSerializer,
    NewsAdminSerializer,
    ServiceAdminSerializer
)


@pytest.mark.django_db
class TestSiteSettingsSerializer:
    """SiteSettings Serializer 測試"""
    
    def test_site_settings_serializer(self):
        """測試公開 API Serializer"""
        settings = SiteSettings.get_instance()
        settings.brand_name = '測試品牌'
        settings.brand_slogan = '測試標語'
        settings.save()
        
        serializer = SiteSettingsSerializer(settings)
        data = serializer.data
        
        assert data['brand_name'] == '測試品牌'
        assert data['brand_slogan'] == '測試標語'
        assert 'id' in data
        assert 'show_price' in data
    
    def test_site_settings_admin_serializer(self):
        """測試管理 API Serializer"""
        settings = SiteSettings.get_instance()
        serializer = SiteSettingsAdminSerializer(settings)
        data = serializer.data
        
        assert 'id' in data
        assert 'brand_name' in data
        assert 'logo_url' in data
        assert 'hero_banner_url' in data


@pytest.mark.django_db
class TestNewsSerializer:
    """News Serializer 測試"""
    
    def test_news_serializer(self):
        """測試公開 API Serializer"""
        news = News.objects.create(
            title='測試消息',
            content='測試內容',
            publish_date=date.today(),
            status='published'
        )
        
        serializer = NewsSerializer(news)
        data = serializer.data
        
        assert data['title'] == '測試消息'
        assert data['content'] == '測試內容'
        assert 'status' not in data  # 公開 API 不返回狀態
    
    def test_news_admin_serializer(self):
        """測試管理 API Serializer"""
        news = News.objects.create(
            title='測試消息',
            content='測試內容',
            publish_date=date.today(),
            status='draft'
        )
        
        serializer = NewsAdminSerializer(news)
        data = serializer.data
        
        assert data['title'] == '測試消息'
        assert data['status'] == 'draft'  # 管理 API 返回狀態


@pytest.mark.django_db
class TestServiceSerializer:
    """Service Serializer 測試"""
    
    def test_service_serializer(self):
        """測試公開 API Serializer"""
        service = Service.objects.create(
            title='測試服務',
            description='測試描述',
            icon_type='fontawesome',
            icon_value='fa-home',
            sort_order=10
        )
        
        serializer = ServiceSerializer(service)
        data = serializer.data
        
        assert data['title'] == '測試服務'
        assert data['description'] == '測試描述'
        assert data['icon_type'] == 'fontawesome'
        assert data['icon_value'] == 'fa-home'
    
    def test_service_admin_serializer(self):
        """測試管理 API Serializer"""
        service = Service.objects.create(
            title='測試服務',
            description='測試描述',
            sort_order=5
        )
        
        serializer = ServiceAdminSerializer(service)
        data = serializer.data
        
        assert data['title'] == '測試服務'
        assert data['sort_order'] == 5

