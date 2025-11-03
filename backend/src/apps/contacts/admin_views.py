"""
聯絡表單管理 API Views（管理員專用）
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Contact
from .serializers import ContactSerializer
from core.permissions import IsAdminUser


class ContactAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """
    聯絡表單管理 ViewSet（管理員專用）
    支援讀取和標記已讀
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAdminUser]
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        標記聯絡表單為已讀
        """
        contact = self.get_object()
        contact.is_read = True
        contact.save()
        
        serializer = self.get_serializer(contact)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        """
        標記聯絡表單為未讀
        """
        contact = self.get_object()
        contact.is_read = False
        contact.save()
        
        serializer = self.get_serializer(contact)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        取得未讀聯絡表單數量
        """
        count = Contact.objects.filter(is_read=False).count()
        
        return Response({
            'status': 'success',
            'data': {'count': count},
        }, status=status.HTTP_200_OK)

