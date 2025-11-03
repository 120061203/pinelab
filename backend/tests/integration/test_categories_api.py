"""
GET /api/categories/ API 整合測試
"""
import pytest
from apps.categories.models import Category


@pytest.mark.django_db
class TestCategoriesAPI:
    """分類 API 測試"""
    
    def test_get_categories_list(self, api_client):
        """測試取得分類列表"""
        Category.objects.create(name='分類1', is_active=True)
        Category.objects.create(name='分類2', is_active=True)
        Category.objects.create(name='分類3', is_active=False)  # 不應出現
        
        response = api_client.get('/api/categories/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']) == 2  # 只有啟用的分類
        assert data['data'][0]['name'] in ['分類1', '分類2']
        assert data['data'][1]['name'] in ['分類1', '分類2']
    
    def test_get_category_detail(self, api_client):
        """測試取得單一分類詳情"""
        category = Category.objects.create(
            name='測試分類',
            description='分類描述'
        )
        
        response = api_client.get(f'/api/categories/{category.id}/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['name'] == '測試分類'
        assert data['data']['description'] == '分類描述'
    
    def test_get_non_existent_category(self, api_client):
        """測試取得不存在分類"""
        response = api_client.get('/api/categories/999/')
        
        assert response.status_code == 404

