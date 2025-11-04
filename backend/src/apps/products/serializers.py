"""
商品 Serializer
"""
from rest_framework import serializers
from .models import Product, ProductImage, ProductTag
from apps.categories.serializers import CategorySerializer
from apps.tags.serializers import TagSerializer


class ProductImageSerializer(serializers.ModelSerializer):
    """
    商品圖片序列化器
    """
    full_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'full_url', 'sort_order', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_full_url(self, obj):
        """生成完整圖片 URL"""
        request = self.context.get('request')
        if request and obj.image_url:
            return request.build_absolute_uri(obj.image_url)
        return obj.image_url


class ProductSerializer(serializers.ModelSerializer):
    """
    商品序列化器
    """
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'sort_order',
            'category', 'tags', 'images', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    """
    商品列表序列化器（簡化版）
    """
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'sort_order',
            'category', 'tags', 'primary_image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_primary_image(self, obj):
        """取得主圖（優先使用 is_primary=True 的圖片，否則使用第一張圖片）"""
        # 優先取得主圖
        primary_image = obj.images.filter(is_primary=True).first()
        # 如果沒有主圖，使用第一張圖片
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image_url)
            return primary_image.image_url
        return None

