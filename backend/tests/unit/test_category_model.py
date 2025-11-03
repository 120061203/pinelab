"""
Category 模型單元測試
"""
import pytest
from django.core.exceptions import ValidationError
from apps.categories.models import Category


@pytest.mark.django_db
class TestCategoryModel:
    """Category 模型測試"""
    
    def test_create_category(self):
        """測試建立分類"""
        category = Category.objects.create(
            name='測試分類',
            description='這是一個測試分類'
        )
        
        assert category.id is not None
        assert category.name == '測試分類'
        assert category.slug == '測試分類'
        assert category.description == '這是一個測試分類'
        assert category.is_active is True
        assert category.sort_order == 0
    
    def test_category_slug_auto_generate(self):
        """測試 slug 自動生成"""
        category = Category.objects.create(name='Test Category')
        assert category.slug == 'test-category'
    
    def test_category_name_unique(self):
        """測試分類名稱唯一性"""
        Category.objects.create(name='唯一分類')
        
        with pytest.raises(Exception):  # Django 會拋出 IntegrityError
            Category.objects.create(name='唯一分類')
    
    def test_category_slug_unique(self):
        """測試 slug 唯一性"""
        Category.objects.create(name='Test')
        
        with pytest.raises(Exception):
            Category.objects.create(name='test')  # slug 會相同
    
    def test_category_ordering(self):
        """測試分類排序"""
        cat1 = Category.objects.create(name='分類1', sort_order=1)
        cat2 = Category.objects.create(name='分類2', sort_order=2)
        cat3 = Category.objects.create(name='分類3', sort_order=0)
        
        categories = list(Category.objects.all())
        assert categories[0].name == '分類2'  # sort_order DESC
        assert categories[1].name == '分類1'
        assert categories[2].name == '分類3'
    
    def test_category_str(self):
        """測試分類字串表示"""
        category = Category.objects.create(name='測試分類')
        assert str(category) == '測試分類'

