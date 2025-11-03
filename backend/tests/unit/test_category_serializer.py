"""
Category Serializer 測試
"""
import pytest
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer


@pytest.mark.django_db
class TestCategorySerializer:
    """Category Serializer 測試"""
    
    def test_serialize_category(self):
        """測試序列化分類"""
        category = Category.objects.create(
            name='測試分類',
            description='這是測試分類'
        )
        
        serializer = CategorySerializer(category)
        data = serializer.data
        
        assert data['id'] == category.id
        assert data['name'] == '測試分類'
        assert data['slug'] == '測試分類'
        assert data['description'] == '這是測試分類'
        assert data['is_active'] is True
        assert 'created_at' in data
        assert 'updated_at' in data
    
    def test_create_category_via_serializer(self):
        """測試透過序列化器建立分類"""
        serializer = CategorySerializer(data={
            'name': '新分類',
            'description': '新分類描述'
        })
        
        assert serializer.is_valid()
        category = serializer.save()
        
        assert category.name == '新分類'
        assert category.slug == '新分類'  # slug 會自動生成
    
    def test_update_category_via_serializer(self):
        """測試透過序列化器更新分類"""
        category = Category.objects.create(name='原始分類')
        
        serializer = CategorySerializer(category, data={
            'name': '更新分類',
            'description': '更新描述'
        }, partial=True)
        
        assert serializer.is_valid()
        updated = serializer.save()
        
        assert updated.name == '更新分類'
        assert updated.description == '更新描述'

