"""
帳號管理 Serializer（管理員專用）
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """使用者序列化器（列表和詳情）"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    deletion_requested_by_username = serializers.CharField(
        source='deletion_requested_by.username',
        read_only=True
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'role', 'role_display', 'is_super_admin', 'is_staff', 'is_active',
            'deletion_scheduled_at', 'deletion_requested_by', 'deletion_requested_by_username',
            'created_at', 'last_login', 'date_joined'
        ]
        read_only_fields = ['id', 'created_at', 'last_login', 'date_joined']
    
    def to_representation(self, instance):
        """自訂表示，排除敏感信息"""
        data = super().to_representation(instance)
        # 確保不會返回密碼相關信息
        return data


class UserCreateSerializer(serializers.ModelSerializer):
    """使用者建立序列化器"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        help_text='密碼至少8個字元'
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'email', 'password',
            'role', 'is_super_admin', 'is_staff', 'is_active'
        ]
    
    def validate(self, attrs):
        """驗證主管理員唯一性和 username 必填"""
        is_super_admin = attrs.get('is_super_admin', False)
        if is_super_admin:
            existing = User.objects.filter(is_super_admin=True).exists()
            if existing:
                raise serializers.ValidationError({
                    'is_super_admin': '系統中只能有一位主管理員'
                })
        
        # username 必須由使用者提供
        if not attrs.get('username'):
            raise serializers.ValidationError({
                'username': '使用者名稱是必填欄位'
            })
        
        return attrs
    
    def create(self, validated_data):
        """建立使用者並加密密碼"""
        password = validated_data.pop('password')
        role = validated_data.get('role')
        # 根據角色自動設定 is_staff（admin/editor=True，analyst=False）
        if role in ['admin', 'editor']:
            validated_data['is_staff'] = True
        elif role == 'analyst':
            validated_data['is_staff'] = False

        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """使用者更新序列化器"""
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        help_text='密碼至少8個字元（可選，不填則不修改）'
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'email', 'password',
            'role', 'is_super_admin', 'is_staff', 'is_active'
        ]
    
    def validate(self, attrs):
        """驗證主管理員唯一性"""
        is_super_admin = attrs.get('is_super_admin')
        instance = self.instance
        
        if is_super_admin is True:
            existing = User.objects.filter(is_super_admin=True)
            if instance:
                existing = existing.exclude(pk=instance.pk)
            if existing.exists():
                raise serializers.ValidationError({
                    'is_super_admin': '系統中只能有一位主管理員'
                })
        return attrs
    
    def update(self, instance, validated_data):
        """更新使用者"""
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # 角色變更時，同步 is_staff 設定
        role = validated_data.get('role', getattr(instance, 'role', None))
        if role in ['admin', 'editor']:
            instance.is_staff = True
        elif role == 'analyst':
            instance.is_staff = False

        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UserSelfUpdateSerializer(serializers.ModelSerializer):
    """使用者自行更新序列化器（僅允許更新 name、email、password）"""
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
        help_text='新密碼（可選，不填則不修改）'
    )
    old_password = serializers.CharField(
        write_only=True,
        required=False,
        help_text='舊密碼（修改密碼時必填）'
    )
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'old_password']
    
    def validate(self, attrs):
        """驗證舊密碼正確性（如果提供新密碼）"""
        password = attrs.get('password')
        old_password = attrs.get('old_password')
        instance = self.instance
        request = self.context.get('request') if hasattr(self, 'context') else None
        is_super_admin = bool(getattr(getattr(request, 'user', None), 'is_super_admin', False))
        
        # 主管理員可免舊密碼直接修改
        if is_super_admin:
            return attrs
        
        if password and not old_password:
            raise serializers.ValidationError({
                'old_password': '修改密碼時必須提供舊密碼'
            })
        
        if password and old_password:
            if not instance.check_password(old_password):
                raise serializers.ValidationError({
                    'old_password': '舊密碼不正確'
                })
        
        return attrs
    
    def update(self, instance, validated_data):
        """更新使用者資訊"""
        password = validated_data.pop('password', None)
        validated_data.pop('old_password', None)  # 移除 old_password，不需要保存
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

