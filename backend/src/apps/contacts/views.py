"""
聯絡表單 Views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Contact
from .serializers import ContactSerializer
from core.permissions import IsPublicEndpoint
from core.signatures import verify_signature


class ContactViewSet(viewsets.ModelViewSet):
    """
    聯絡表單 ViewSet
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsPublicEndpoint]
    
    def get_queryset(self):
        """管理員可以看到所有聯絡表單"""
        queryset = super().get_queryset()
        
        # 公開端點只能建立，不能讀取
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            # 這些動作需要管理員權限（將在 Phase 5 實作）
            return queryset.none()
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        建立聯絡表單（需 HMAC-SHA256 簽章驗證）
        """
        # 驗證簽章
        data = request.data.copy()
        provided_sign = data.get('sign')
        timestamp = data.get('timestamp')
        
        if not provided_sign or not timestamp:
            return Response({
                'status': 'error',
                'code': 'MISSING_SIGNATURE',
                'message': '缺少簽章或時間戳記',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 驗證時間戳記（±5 分鐘內有效）
        try:
            timestamp_int = int(timestamp)
            current_timestamp = int(timezone.now().timestamp() * 1000)
            time_diff = abs(current_timestamp - timestamp_int)
            
            if time_diff > 5 * 60 * 1000:  # 5 分鐘
                return Response({
                    'status': 'error',
                    'code': 'TIMESTAMP_EXPIRED',
                    'message': '時間戳記已過期',
                }, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({
                'status': 'error',
                'code': 'INVALID_TIMESTAMP',
                'message': '無效的時間戳記',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 驗證簽章
        params = {
            'name': data.get('name'),
            'email': data.get('email'),
            'message': data.get('message'),
            'sign': provided_sign,
            'timestamp': timestamp,
        }
        
        if not verify_signature(params, provided_sign):
            return Response({
                'status': 'error',
                'code': 'INVALID_SIGNATURE',
                'message': '簽章驗證失敗',
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # 移除簽章和時間戳記後建立聯絡表單
        data.pop('sign', None)
        data.pop('timestamp', None)
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'status': 'success',
            'data': {
                'message': '聯絡表單已成功提交',
            },
        }, status=status.HTTP_201_CREATED)

