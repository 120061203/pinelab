"""
商品篩選與搜尋
"""
import django_filters
from django.db.models import Q
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """
    商品篩選器
    """
    category = django_filters.NumberFilter(field_name='category_id')
    tags = django_filters.BaseInFilter(field_name='tags__id', lookup_expr='in')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    search = django_filters.CharFilter(method='filter_search')
    sort = django_filters.CharFilter(method='filter_sort')
    
    class Meta:
        model = Product
        fields = ['category', 'tags', 'min_price', 'max_price', 'search', 'sort']
    
    def filter_search(self, queryset, name, value):
        """
        搜尋商品（名稱、描述、標籤）
        """
        if not value:
            return queryset
        
        return queryset.filter(
            Q(name__icontains=value) |
            Q(description__icontains=value) |
            Q(tags__name__icontains=value)
        ).distinct()
    
    def filter_sort(self, queryset, name, value):
        """
        排序商品
        支援：sort_order, updated_at, price, -price
        """
        if value == 'sort_order':
            return queryset.order_by('-sort_order', '-updated_at')
        elif value == 'updated_at':
            return queryset.order_by('-updated_at')
        elif value == 'price':
            return queryset.order_by('price')
        elif value == '-price':
            return queryset.order_by('-price')
        else:
            # 預設：sort_order DESC, updated_at DESC
            return queryset.order_by('-sort_order', '-updated_at')

