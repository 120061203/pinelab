"""
SiteSettings, News, Service 模型單元測試
"""
import pytest
from datetime import date, timedelta
from django.core.exceptions import ValidationError
from apps.site_settings.models import SiteSettings, News, Service


@pytest.mark.django_db
class TestSiteSettingsModel:
    """SiteSettings 模型測試"""
    
    def test_get_instance_creates_singleton(self):
        """測試 get_instance 建立單例"""
        instance1 = SiteSettings.get_instance()
        instance2 = SiteSettings.get_instance()
        
        assert instance1.id == instance2.id
        assert instance1.key == 'site_settings'
        assert instance2.key == 'site_settings'
    
    def test_singleton_constraint(self):
        """測試單例約束"""
        SiteSettings.objects.create(key='site_settings')
        
        # 嘗試建立第二個應該失敗
        with pytest.raises(Exception):  # IntegrityError
            SiteSettings.objects.create(key='site_settings')
    
    def test_url_validation(self):
        """測試 URL 欄位驗證"""
        settings = SiteSettings.get_instance()
        settings.shopee_link = 'invalid-url'
        
        with pytest.raises(ValidationError):
            settings.full_clean()
    
    def test_valid_url(self):
        """測試有效 URL"""
        settings = SiteSettings.get_instance()
        settings.shopee_link = 'https://shopee.tw/shop/123'
        settings.full_clean()  # 不應該拋出異常
        assert settings.shopee_link == 'https://shopee.tw/shop/123'


@pytest.mark.django_db
class TestNewsModel:
    """News 模型測試"""
    
    def test_create_news(self):
        """測試建立最新消息"""
        news = News.objects.create(
            title='測試消息',
            content='這是測試內容',
            publish_date=date.today(),
            status='draft'
        )
        
        assert news.id is not None
        assert news.title == '測試消息'
        assert news.status == 'draft'
        assert news.publish_date == date.today()
    
    def test_news_default_status(self):
        """測試預設狀態為草稿"""
        news = News.objects.create(
            title='測試',
            content='內容',
            publish_date=date.today()
        )
        
        assert news.status == 'draft'
    
    def test_news_status_choices(self):
        """測試狀態選項"""
        news = News.objects.create(
            title='測試',
            content='內容',
            publish_date=date.today(),
            status='published'
        )
        
        assert news.status == 'published'
    
    def test_news_ordering(self):
        """測試排序（按發布日期降序）"""
        today = date.today()
        news1 = News.objects.create(
            title='消息1',
            content='內容1',
            publish_date=today - timedelta(days=1),
            status='published'
        )
        news2 = News.objects.create(
            title='消息2',
            content='內容2',
            publish_date=today,
            status='published'
        )
        
        news_list = list(News.objects.all())
        assert news_list[0].publish_date >= news_list[1].publish_date


@pytest.mark.django_db
class TestServiceModel:
    """Service 模型測試"""
    
    def test_create_service(self):
        """測試建立服務項目"""
        service = Service.objects.create(
            title='測試服務',
            description='這是測試服務描述',
            icon_type='fontawesome',
            icon_value='fa-home',
            sort_order=10
        )
        
        assert service.id is not None
        assert service.title == '測試服務'
        assert service.icon_type == 'fontawesome'
        assert service.icon_value == 'fa-home'
        assert service.sort_order == 10
    
    def test_service_icon_validation(self):
        """測試圖標欄位驗證"""
        # icon_type 為 NULL 時，icon_value 也必須為 NULL
        service = Service(
            title='測試',
            description='描述',
            icon_type=None,
            icon_value='fa-home'
        )
        
        with pytest.raises(ValidationError):
            service.full_clean()
    
    def test_service_icon_required_when_type_set(self):
        """測試當 icon_type 有值時，icon_value 也必須有值"""
        service = Service(
            title='測試',
            description='描述',
            icon_type='fontawesome',
            icon_value=None
        )
        
        with pytest.raises(ValidationError):
            service.full_clean()
    
    def test_service_ordering(self):
        """測試排序（按 sort_order 降序）"""
        service1 = Service.objects.create(
            title='服務1',
            description='描述1',
            sort_order=5
        )
        service2 = Service.objects.create(
            title='服務2',
            description='描述2',
            sort_order=10
        )
        
        services = list(Service.objects.all())
        assert services[0].sort_order >= services[1].sort_order

