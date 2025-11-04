"""
商品管理 Serializer（管理員專用）
"""
from rest_framework import serializers
from .models import Product, ProductImage, ProductTag
from apps.categories.serializers import CategorySerializer
from apps.tags.serializers import TagSerializer


class ProductImageAdminSerializer(serializers.ModelSerializer):
    """
    商品圖片管理序列化器
    """
    full_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image_url', 'full_url', 'sort_order', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_full_url(self, obj):
        """生成完整圖片 URL"""
        request = self.context.get('request')
        if request and obj.image_url:
            # 如果是相對路徑，生成完整 URL
            if obj.image_url.startswith('/'):
                return request.build_absolute_uri(obj.image_url)
            # 如果已經是完整 URL，直接返回
            if obj.image_url.startswith('http://') or obj.image_url.startswith('https://'):
                return obj.image_url
        return obj.image_url


class ProductAdminSerializer(serializers.ModelSerializer):
    """
    商品管理序列化器（支援完整 CRUD）
    """
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    images = ProductImageAdminSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'sort_order',
            'category', 'category_id', 'tags', 'tag_ids', 'images',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """建立商品並關聯標籤"""
        tag_ids = validated_data.pop('tag_ids', [])
        category_id = validated_data.pop('category_id', None)
        
        if category_id:
            from apps.categories.models import Category
            validated_data['category'] = Category.objects.get(id=category_id)
        
        product = Product.objects.create(**validated_data)
        
        if tag_ids:
            from apps.tags.models import Tag
            tags = Tag.objects.filter(id__in=tag_ids)
            product.tags.set(tags)
        
        return product
    
    def update(self, instance, validated_data):
        """更新商品並關聯標籤"""
        tag_ids = validated_data.pop('tag_ids', None)
        category_id = validated_data.pop('category_id', None)
        
        if category_id is not None:
            from apps.categories.models import Category
            if category_id:
                validated_data['category'] = Category.objects.get(id=category_id)
            else:
                validated_data['category'] = None
        
        # 更新基本欄位
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 更新標籤
        if tag_ids is not None:
            from apps.tags.models import Tag
            tags = Tag.objects.filter(id__in=tag_ids)
            instance.tags.set(tags)
        
        return instance

