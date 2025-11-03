"""
Tag Serializer 測試
"""
import pytest
from apps.tags.models import Tag
from apps.tags.serializers import TagSerializer


@pytest.mark.django_db
class TestTagSerializer:
    """Tag Serializer 測試"""
    
    def test_serialize_tag(self):
        """測試序列化標籤"""
        tag = Tag.objects.create(name='測試標籤')
        
        serializer = TagSerializer(tag)
        data = serializer.data
        
        assert data['id'] == tag.id
        assert data['name'] == '測試標籤'
        assert data['slug'] == '測試標籤'
        assert 'created_at' in data
        assert 'updated_at' in data
    
    def test_create_tag_via_serializer(self):
        """測試透過序列化器建立標籤"""
        serializer = TagSerializer(data={'name': '新標籤'})
        
        assert serializer.is_valid()
        tag = serializer.save()
        
        assert tag.name == '新標籤'
        assert tag.slug == '新標籤'
    
    def test_update_tag_via_serializer(self):
        """測試透過序列化器更新標籤"""
        tag = Tag.objects.create(name='原始標籤')
        
        serializer = TagSerializer(tag, data={'name': '更新標籤'}, partial=True)
        
        assert serializer.is_valid()
        updated = serializer.save()
        
        assert updated.name == '更新標籤'

