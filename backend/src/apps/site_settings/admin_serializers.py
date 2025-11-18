"""
網站設定管理 API Serializer
"""
import os
import time
import json
from datetime import datetime
from rest_framework import serializers
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from django.core.exceptions import ValidationError
from django.conf import settings
from .models import SiteSettings, News, Service


def get_timestamp_filename(prefix, ext):
    """
    生成帶時間戳記的檔案名稱
    格式：prefix_YYYYMMDD_HHMMSS.ext
    """
    now = datetime.now()
    timestamp = now.strftime('%Y%m%d_%H%M%S')
    return f'{prefix}_{timestamp}.{ext}'


def validate_image_file(file, allowed_formats, max_size_mb, field_name):
    """
    驗證圖片檔案格式和大小
    
    Args:
        file: 上傳的檔案
        allowed_formats: 允許的格式列表，例如 ['svg'] 或 ['jpg', 'jpeg', 'png', 'webp']
        max_size_mb: 最大檔案大小（MB）
        field_name: 欄位名稱（用於錯誤訊息）
    
    Returns:
        str: 檔案副檔名
    
    Raises:
        ValidationError: 如果格式或大小不符合要求
    """
    if not file:
        return None
    
    # 檢查檔案大小
    file_size = file.size
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        raise ValidationError(f'{field_name} 檔案大小不能超過 {max_size_mb}MB')
    
    # 取得檔案副檔名
    file_name = file.name
    ext = os.path.splitext(file_name)[1].lower().lstrip('.')
    
    # 檢查格式
    if ext not in allowed_formats:
        raise ValidationError(f'{field_name} 只允許 {", ".join(allowed_formats)} 格式')
    
    return ext


class SiteSettingsAdminSerializer(serializers.ModelSerializer):
    """
    網站設定管理序列化器（管理員專用）
    支援檔案上傳
    """
    logo = serializers.FileField(write_only=True, required=False, allow_null=True)
    hero_banner = serializers.ImageField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'brand_name', 'brand_slogan', 'logo_url', 'hero_banner_url',
            'logo', 'hero_banner',  # 檔案上傳欄位
            'external_links', 'show_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_logo(self, value):
        """驗證 Logo 檔案"""
        if value:
            validate_image_file(value, ['svg'], 2, 'Logo')
        return value
    
    def validate_hero_banner(self, value):
        """驗證 Hero 橫幅檔案"""
        if value:
            validate_image_file(value, ['jpg', 'jpeg', 'png', 'webp'], 5, 'Hero橫幅')
        return value
    
    def validate_external_links(self, value):
        """驗證外部連結格式"""
        if value is None:
            return []
        
        # 如果是字符串（從 FormData 來的 JSON 字符串），解析它
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise ValidationError('外部連結格式錯誤：無法解析 JSON')
        
        if not isinstance(value, list):
            raise ValidationError('外部連結必須是一個陣列')
        
        for idx, link in enumerate(value):
            if not isinstance(link, dict):
                raise ValidationError(f'外部連結第 {idx + 1} 項必須是一個物件')
            
            if 'name' not in link or not link.get('name'):
                raise ValidationError(f'外部連結第 {idx + 1} 項缺少顯示名稱')
            
            if 'url' not in link or not link.get('url'):
                raise ValidationError(f'外部連結第 {idx + 1} 項缺少 URL')
            
            url = link['url']
            if not (url.startswith('http://') or url.startswith('https://')):
                raise ValidationError(f'外部連結第 {idx + 1} 項的 URL 必須是有效的 HTTP/HTTPS URL')
        
        return value
    
    def validate(self, attrs):
        """驗證整體資料"""
        return attrs
    
    def update(self, instance, validated_data):
        """更新網站設定，處理檔案上傳"""
        logo_file = validated_data.pop('logo', None)
        hero_banner_file = validated_data.pop('hero_banner', None)
        
        # 處理 Logo 上傳
        if logo_file:
            # 刪除舊檔案
            if instance.logo_url:
                old_path = os.path.join(settings.MEDIA_ROOT, instance.logo_url.lstrip('/media/'))
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except OSError:
                        pass
            
            # 儲存新檔案
            file_name = get_timestamp_filename('logo', 'svg')
            file_path = os.path.join(settings.MEDIA_ROOT, 'site', file_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'wb') as f:
                for chunk in logo_file.chunks():
                    f.write(chunk)
            
            validated_data['logo_url'] = f'/media/site/{file_name}'
        
        # 處理 Hero 橫幅上傳
        if hero_banner_file:
            # 刪除舊檔案
            if instance.hero_banner_url:
                old_path = os.path.join(settings.MEDIA_ROOT, instance.hero_banner_url.lstrip('/media/'))
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except OSError:
                        pass
            
            # 儲存新檔案
            ext = validate_image_file(hero_banner_file, ['jpg', 'jpeg', 'png', 'webp'], 5, 'Hero橫幅')
            file_name = get_timestamp_filename('hero-banner', ext)
            file_path = os.path.join(settings.MEDIA_ROOT, 'site', file_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'wb') as f:
                for chunk in hero_banner_file.chunks():
                    f.write(chunk)
            
            validated_data['hero_banner_url'] = f'/media/site/{file_name}'
        
        return super().update(instance, validated_data)


class NewsAdminSerializer(serializers.ModelSerializer):
    """
    最新消息管理序列化器（管理員專用）
    支援圖片上傳
    """
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = News
        fields = [
            'id', 'title', 'content', 'publish_date', 'image_url', 'status',
            'created_at', 'updated_at', 'image'
        ]
        read_only_fields = ['id', 'image_url', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """驗證標題長度"""
        if len(value) > 200:
            raise ValidationError('標題長度不能超過 200 字元')
        return value
    
    def validate_content(self, value):
        """驗證內容長度"""
        if len(value) > 5000:
            raise ValidationError('內容長度不能超過 5000 字元')
        return value
    
    def create(self, validated_data):
        """建立最新消息，處理圖片上傳"""
        image_file = validated_data.pop('image', None)
        
        if image_file:
            # 儲存圖片檔案
            ext = validate_image_file(image_file, ['jpg', 'jpeg', 'png', 'webp'], 5, '消息圖片')
            file_name = get_timestamp_filename('news', ext)
            file_path = os.path.join(settings.MEDIA_ROOT, 'site', 'news', file_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'wb') as f:
                for chunk in image_file.chunks():
                    f.write(chunk)
            
            validated_data['image_url'] = f'/media/site/news/{file_name}'
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """更新最新消息，處理圖片上傳"""
        image_file = validated_data.pop('image', None)
        
        if image_file:
            # 刪除舊圖片
            if instance.image_url:
                old_path = os.path.join(settings.MEDIA_ROOT, instance.image_url.lstrip('/media/'))
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except OSError:
                        pass
            
            # 儲存新圖片
            ext = validate_image_file(image_file, ['jpg', 'jpeg', 'png', 'webp'], 5, '消息圖片')
            file_name = get_timestamp_filename('news', ext)
            file_path = os.path.join(settings.MEDIA_ROOT, 'site', 'news', file_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'wb') as f:
                for chunk in image_file.chunks():
                    f.write(chunk)
            
            validated_data['image_url'] = f'/media/site/news/{file_name}'
        
        return super().update(instance, validated_data)


class ServiceAdminSerializer(serializers.ModelSerializer):
    """
    服務項目管理序列化器（管理員專用）
    支援圖標檔案上傳
    """
    icon_file = serializers.ImageField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'title', 'description', 'icon_type', 'icon_value',
            'icon_file',  # 檔案上傳欄位
            'sort_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """驗證標題長度"""
        if len(value) > 100:
            raise ValidationError('標題長度不能超過 100 字元')
        return value
    
    def validate_description(self, value):
        """驗證描述長度"""
        if len(value) > 500:
            raise ValidationError('描述長度不能超過 500 字元')
        return value
    
    def validate_icon_file(self, value):
        """驗證圖標檔案"""
        if value:
            validate_image_file(value, ['svg', 'png'], 1, '圖標')
        return value
    
    def validate(self, attrs):
        """驗證圖標欄位一致性"""
        icon_type = attrs.get('icon_type')
        icon_value = attrs.get('icon_value')
        icon_file = attrs.get('icon_file')
        
        # 如果 icon_type 為 NULL，icon_value 和 icon_file 也必須為 NULL
        if not icon_type:
            if icon_value:
                raise ValidationError({'icon_value': '當圖標類型為空時，圖標值也必須為空'})
            if icon_file:
                raise ValidationError({'icon_file': '當圖標類型為空時，不能上傳圖標檔案'})
        else:
            # 如果 icon_type 為 'custom'，必須提供 icon_file 或 icon_value
            if icon_type == 'custom':
                if not icon_file and not icon_value:
                    raise ValidationError({'icon_file': '自訂圖標必須上傳檔案或提供 URL'})
            # 如果 icon_type 為 'fontawesome' 或 'material'，必須提供 icon_value
            elif icon_type in ['fontawesome', 'material']:
                if not icon_value:
                    raise ValidationError({'icon_value': '內建圖標必須提供圖標名稱'})
        
        return attrs
    
    def create(self, validated_data):
        """建立服務項目，處理圖標檔案上傳"""
        icon_file = validated_data.pop('icon_file', None)
        
        if icon_file and validated_data.get('icon_type') == 'custom':
            # 儲存圖標檔案
            ext = validate_image_file(icon_file, ['svg', 'png'], 1, '圖標')
            file_name = get_timestamp_filename('icon', ext)
            file_path = os.path.join(settings.MEDIA_ROOT, 'site', 'icons', file_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'wb') as f:
                for chunk in icon_file.chunks():
                    f.write(chunk)
            
            validated_data['icon_value'] = f'/media/site/icons/{file_name}'
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """更新服務項目，處理圖標檔案上傳"""
        icon_file = validated_data.pop('icon_file', None)
        
        if icon_file and validated_data.get('icon_type') == 'custom':
            # 刪除舊檔案（如果存在）
            if instance.icon_value and instance.icon_value.startswith('/media/'):
                old_path = os.path.join(settings.MEDIA_ROOT, instance.icon_value.lstrip('/media/'))
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except OSError:
                        pass
            
            # 儲存新檔案
            ext = validate_image_file(icon_file, ['svg', 'png'], 1, '圖標')
            file_name = get_timestamp_filename('icon', ext)
            file_path = os.path.join(settings.MEDIA_ROOT, 'site', 'icons', file_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'wb') as f:
                for chunk in icon_file.chunks():
                    f.write(chunk)
            
            validated_data['icon_value'] = f'/media/site/icons/{file_name}'
        
        return super().update(instance, validated_data)

