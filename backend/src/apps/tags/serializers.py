"""
標籤 Serializer
"""
from rest_framework import serializers
from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    """
    標籤序列化器
    """
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

