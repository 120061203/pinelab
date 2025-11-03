"""
聯絡表單 Serializer
"""
from rest_framework import serializers
from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    """
    聯絡表單序列化器
    """
    
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'is_read', 'created_at']
    
    def validate_name(self, value):
        """驗證姓名長度"""
        if len(value) < 2:
            raise serializers.ValidationError('姓名至少需要 2 個字元')
        if len(value) > 100:
            raise serializers.ValidationError('姓名不能超過 100 個字元')
        return value
    
    def validate_message(self, value):
        """驗證訊息長度"""
        if len(value) < 10:
            raise serializers.ValidationError('訊息至少需要 10 個字元')
        if len(value) > 2000:
            raise serializers.ValidationError('訊息不能超過 2000 個字元')
        return value

