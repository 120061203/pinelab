"""
Tag 模型單元測試
"""
import pytest
from apps.tags.models import Tag


@pytest.mark.django_db
class TestTagModel:
    """Tag 模型測試"""
    
    def test_create_tag(self):
        """測試建立標籤"""
        tag = Tag.objects.create(name='測試標籤')
        
        assert tag.id is not None
        assert tag.name == '測試標籤'
        assert tag.slug == '測試標籤'
    
    def test_tag_slug_auto_generate(self):
        """測試 slug 自動生成"""
        tag = Tag.objects.create(name='Test Tag')
        assert tag.slug == 'test-tag'
    
    def test_tag_name_unique(self):
        """測試標籤名稱唯一性"""
        Tag.objects.create(name='唯一標籤')
        
        with pytest.raises(Exception):
            Tag.objects.create(name='唯一標籤')
    
    def test_tag_str(self):
        """測試標籤字串表示"""
        tag = Tag.objects.create(name='測試標籤')
        assert str(tag) == '測試標籤'

