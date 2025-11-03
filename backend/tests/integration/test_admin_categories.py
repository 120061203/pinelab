"""
分類管理 API 測試（CRUD）
"""
import pytest
from apps.categories.models import Category


@pytest.mark.django_db
class TestAdminCategories:
    """管理員分類管理 API 測試"""
    
    def test_create_category(self, authenticated_client):
        """測試建立分類"""
        response = authenticated_client.post('/api/admin/categories/', {
            'name': '新分類',
            'description': '分類描述',
            'sort_order': 0,
            'is_active': True,
        }, format='json')
        
        assert response.status_code == 201
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['name'] == '新分類'
    
    def test_list_categories(self, authenticated_client):
        """測試取得分類列表"""
        Category.objects.create(name='分類1')
        Category.objects.create(name='分類2')
        
        response = authenticated_client.get('/api/admin/categories/')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']) >= 2
    
    def test_get_category(self, authenticated_client):
        """測試取得單一分類"""
        category = Category.objects.create(name='測試分類')
        
        response = authenticated_client.get(f'/api/admin/categories/{category.id}/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['name'] == '測試分類'
    
    def test_update_category(self, authenticated_client):
        """測試更新分類"""
        category = Category.objects.create(name='原始分類')
        
        response = authenticated_client.patch(f'/api/admin/categories/{category.id}/', {
            'name': '更新分類',
        }, format='json')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['name'] == '更新分類'
    
    def test_delete_category(self, authenticated_client):
        """測試刪除分類"""
        category = Category.objects.create(name='待刪除分類')
        
        response = authenticated_client.delete(f'/api/admin/categories/{category.id}/')
        
        assert response.status_code == 204
        assert not Category.objects.filter(id=category.id).exists()

