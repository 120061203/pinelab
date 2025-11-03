"""
GET /api/tags/ API 整合測試
"""
import pytest
from apps.tags.models import Tag


@pytest.mark.django_db
class TestTagsAPI:
    """標籤 API 測試"""
    
    def test_get_tags_list(self, api_client):
        """測試取得標籤列表"""
        Tag.objects.create(name='標籤1')
        Tag.objects.create(name='標籤2')
        Tag.objects.create(name='標籤3')
        
        response = api_client.get('/api/tags/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']) == 3
    
    def test_get_tag_detail(self, api_client):
        """測試取得單一標籤詳情"""
        tag = Tag.objects.create(name='測試標籤')
        
        response = api_client.get(f'/api/tags/{tag.id}/')
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['name'] == '測試標籤'
    
    def test_tags_ordering(self, api_client):
        """測試標籤排序（依名稱）"""
        Tag.objects.create(name='C標籤')
        Tag.objects.create(name='A標籤')
        Tag.objects.create(name='B標籤')
        
        response = api_client.get('/api/tags/')
        data = response.json()
        
        names = [tag['name'] for tag in data['data']]
        assert names == ['A標籤', 'B標籤', 'C標籤']

