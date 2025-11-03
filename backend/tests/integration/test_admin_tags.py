"""
標籤管理 API 測試（CRUD）
"""
import pytest
from apps.tags.models import Tag


@pytest.mark.django_db
class TestAdminTags:
    """管理員標籤管理 API 測試"""
    
    def test_create_tag(self, authenticated_client):
        """測試建立標籤"""
        response = authenticated_client.post('/api/admin/tags/', {
            'name': '新標籤',
        }, format='json')
        
        assert response.status_code == 201
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['name'] == '新標籤'
    
    def test_list_tags(self, authenticated_client):
        """測試取得標籤列表"""
        Tag.objects.create(name='標籤1')
        Tag.objects.create(name='標籤2')
        
        response = authenticated_client.get('/api/admin/tags/')
        
        assert response.status_code == 200
        data = response.json()
        assert len(data['data']) >= 2
    
    def test_get_tag(self, authenticated_client):
        """測試取得單一標籤"""
        tag = Tag.objects.create(name='測試標籤')
        
        response = authenticated_client.get(f'/api/admin/tags/{tag.id}/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['name'] == '測試標籤'
    
    def test_update_tag(self, authenticated_client):
        """測試更新標籤"""
        tag = Tag.objects.create(name='原始標籤')
        
        response = authenticated_client.patch(f'/api/admin/tags/{tag.id}/', {
            'name': '更新標籤',
        }, format='json')
        
        assert response.status_code == 200
        data = response.json()
        assert data['data']['name'] == '更新標籤'
    
    def test_delete_tag(self, authenticated_client):
        """測試刪除標籤"""
        tag = Tag.objects.create(name='待刪除標籤')
        
        response = authenticated_client.delete(f'/api/admin/tags/{tag.id}/')
        
        assert response.status_code == 204
        assert not Tag.objects.filter(id=tag.id).exists()

