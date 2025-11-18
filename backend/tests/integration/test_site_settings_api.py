"""
網站設定 API 整合測試
"""
import pytest
from datetime import date, timedelta
from django.utils import timezone
from apps.site_settings.models import SiteSettings, News, Service
from apps.auth.models import User


@pytest.mark.django_db
class TestSiteSettingsPublicAPI:
    """網站設定公開 API 測試"""
    
    def test_get_site_settings(self, api_client):
        """測試取得網站設定"""
        settings = SiteSettings.get_instance()
        settings.brand_name = '測試品牌'
        settings.save()
        
        response = api_client.get('/api/site-settings/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['brand_name'] == '測試品牌'
    
    def test_site_settings_singleton_behavior(self, api_client):
        """測試單例行為"""
        # 建立多個請求應該返回同一個實例
        response1 = api_client.get('/api/site-settings/')
        response2 = api_client.get('/api/site-settings/')
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        data1 = response1.json()['data']
        data2 = response2.json()['data']
        assert data1['id'] == data2['id']


@pytest.mark.django_db
class TestSiteSettingsAdminAPI:
    """網站設定管理 API 測試"""
    
    def test_get_site_settings_admin(self, authenticated_client):
        """測試管理員取得網站設定"""
        response = authenticated_client.get('/api/admin/site-settings/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert 'data' in data
    
    def test_update_site_settings(self, authenticated_client):
        """測試更新網站設定"""
        settings = SiteSettings.get_instance()
        
        update_data = {
            'brand_name': '新品牌名稱',
            'brand_slogan': '新品牌標語',
            'show_price': False
        }
        
        response = authenticated_client.put(
            '/api/admin/site-settings/',
            data=update_data,
            format='json'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['brand_name'] == '新品牌名稱'
        assert data['data']['show_price'] is False
        
        # 驗證資料已更新
        settings.refresh_from_db()
        assert settings.brand_name == '新品牌名稱'
        assert settings.show_price is False
    
    def test_update_site_settings_unauthorized(self, api_client):
        """測試未授權更新"""
        response = api_client.put(
            '/api/admin/site-settings/',
            data={'brand_name': '測試'},
            format='json'
        )
        
        assert response.status_code == 401


@pytest.mark.django_db
class TestNewsPublicAPI:
    """最新消息公開 API 測試"""
    
    def test_get_published_news(self, api_client):
        """測試取得已發布消息"""
        today = date.today()
        News.objects.create(
            title='已發布消息',
            content='內容',
            publish_date=today,
            status='published'
        )
        News.objects.create(
            title='草稿消息',
            content='內容',
            publish_date=today,
            status='draft'
        )
        
        response = api_client.get('/api/news/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']) == 1
        assert data['data'][0]['title'] == '已發布消息'
    
    def test_get_news_with_limit(self, api_client):
        """測試限制返回數量"""
        today = date.today()
        for i in range(10):
            News.objects.create(
                title=f'消息{i}',
                content='內容',
                publish_date=today - timedelta(days=i),
                status='published'
            )
        
        response = api_client.get('/api/news/?limit=5')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']) == 5
    
    def test_get_news_only_published_and_past(self, api_client):
        """測試只返回已發布且發布日期小於等於當前日期的消息"""
        today = date.today()
        News.objects.create(
            title='已發布（今天）',
            content='內容',
            publish_date=today,
            status='published'
        )
        News.objects.create(
            title='已發布（未來）',
            content='內容',
            publish_date=today + timedelta(days=1),
            status='published'
        )
        News.objects.create(
            title='草稿',
            content='內容',
            publish_date=today,
            status='draft'
        )
        
        response = api_client.get('/api/news/')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']) == 1
        assert data['data'][0]['title'] == '已發布（今天）'


@pytest.mark.django_db
class TestNewsAdminAPI:
    """最新消息管理 API 測試"""
    
    def test_get_news_list_admin(self, authenticated_client):
        """測試管理員取得消息列表"""
        today = date.today()
        News.objects.create(
            title='消息1',
            content='內容1',
            publish_date=today,
            status='published'
        )
        News.objects.create(
            title='消息2',
            content='內容2',
            publish_date=today,
            status='draft'
        )
        
        response = authenticated_client.get('/api/admin/news/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']) == 2  # 管理員可以看到所有消息
    
    def test_create_news(self, authenticated_client):
        """測試建立最新消息"""
        today = date.today()
        create_data = {
            'title': '新消息',
            'content': '消息內容',
            'publish_date': today.isoformat(),
            'status': 'draft'
        }
        
        response = authenticated_client.post(
            '/api/admin/news/',
            data=create_data,
            format='json'
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['title'] == '新消息'
        assert data['data']['status'] == 'draft'
    
    def test_update_news(self, authenticated_client):
        """測試更新最新消息"""
        news = News.objects.create(
            title='原始標題',
            content='原始內容',
            publish_date=date.today(),
            status='draft'
        )
        
        update_data = {
            'title': '更新標題',
            'content': '更新內容',
            'publish_date': date.today().isoformat(),
            'status': 'published'
        }
        
        response = authenticated_client.put(
            f'/api/admin/news/{news.id}/',
            data=update_data,
            format='json'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['title'] == '更新標題'
        assert data['data']['status'] == 'published'
    
    def test_toggle_news_status(self, authenticated_client):
        """測試切換消息狀態"""
        news = News.objects.create(
            title='測試消息',
            content='內容',
            publish_date=date.today(),
            status='draft'
        )
        
        response = authenticated_client.patch(
            f'/api/admin/news/{news.id}/toggle-status/',
            data={'status': 'published'},
            format='json'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['status'] == 'published'
        
        news.refresh_from_db()
        assert news.status == 'published'
    
    def test_delete_news(self, authenticated_client):
        """測試刪除最新消息"""
        news = News.objects.create(
            title='待刪除消息',
            content='內容',
            publish_date=date.today(),
            status='published'
        )
        
        response = authenticated_client.delete(f'/api/admin/news/{news.id}/')
        
        assert response.status_code == 204
        assert not News.objects.filter(id=news.id).exists()


@pytest.mark.django_db
class TestServicesPublicAPI:
    """服務項目公開 API 測試"""
    
    def test_get_services(self, api_client):
        """測試取得服務項目列表"""
        Service.objects.create(
            title='服務1',
            description='描述1',
            sort_order=10
        )
        Service.objects.create(
            title='服務2',
            description='描述2',
            sort_order=5
        )
        
        response = api_client.get('/api/services/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']) == 2
        # 應該按 sort_order 降序排列
        assert data['data'][0]['sort_order'] >= data['data'][1]['sort_order']


@pytest.mark.django_db
class TestServicesAdminAPI:
    """服務項目管理 API 測試"""
    
    def test_get_services_admin(self, authenticated_client):
        """測試管理員取得服務列表"""
        Service.objects.create(
            title='服務1',
            description='描述1',
            sort_order=10
        )
        
        response = authenticated_client.get('/api/admin/services/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']) >= 1
    
    def test_create_service(self, authenticated_client):
        """測試建立服務項目"""
        create_data = {
            'title': '新服務',
            'description': '服務描述',
            'icon_type': 'fontawesome',
            'icon_value': 'fa-home',
            'sort_order': 10
        }
        
        response = authenticated_client.post(
            '/api/admin/services/',
            data=create_data,
            format='json'
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['title'] == '新服務'
    
    def test_update_service_sort_order(self, authenticated_client):
        """測試更新服務排序"""
        service = Service.objects.create(
            title='服務',
            description='描述',
            sort_order=5
        )
        
        response = authenticated_client.patch(
            f'/api/admin/services/{service.id}/update-sort/',
            data={'sort_order': 20},
            format='json'
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['sort_order'] == 20
        
        service.refresh_from_db()
        assert service.sort_order == 20
    
    def test_delete_service(self, authenticated_client):
        """測試刪除服務項目"""
        service = Service.objects.create(
            title='待刪除服務',
            description='描述',
            sort_order=5
        )
        
        response = authenticated_client.delete(f'/api/admin/services/{service.id}/')
        
        assert response.status_code == 204
        assert not Service.objects.filter(id=service.id).exists()

