"""
網站設定公開 API Serializer
"""
from rest_framework import serializers
from .models import SiteSettings, News, Service


class SiteSettingsSerializer(serializers.ModelSerializer):
    """
    網站設定序列化器（公開 API）
    """
    
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'brand_name', 'brand_slogan', 'logo_url', 'hero_banner_url',
            'external_links', 'show_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NewsSerializer(serializers.ModelSerializer):
    """
    最新消息序列化器（公開 API）
    只返回已發布的消息
    """
    
    class Meta:
        model = News
        fields = ['id', 'title', 'slug', 'content', 'publish_date', 'images', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ServiceSerializer(serializers.ModelSerializer):
    """
    服務項目序列化器（公開 API）
    """
    
    class Meta:
        model = Service
        fields = [
            'id', 'title', 'description', 'icon_type', 'icon_value',
            'sort_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

