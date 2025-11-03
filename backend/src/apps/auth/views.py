"""
認證 Views
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from core.permissions import IsAdminUser


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    管理員登入端點
    返回 JWT access 和 refresh tokens
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'status': 'error',
            'code': 'MISSING_CREDENTIALS',
            'message': '請提供使用者名稱和密碼',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response({
            'status': 'error',
            'code': 'INVALID_CREDENTIALS',
            'message': '使用者名稱或密碼錯誤',
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user.is_staff:
        return Response({
            'status': 'error',
            'code': 'NOT_ADMIN',
            'message': '只有管理員可以登入',
        }, status=status.HTTP_403_FORBIDDEN)
    
    # 生成 JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'status': 'success',
        'data': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            },
        },
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def logout(request):
    """
    管理員登出端點
    將 refresh token 加入黑名單
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response({
            'status': 'error',
            'code': 'MISSING_REFRESH_TOKEN',
            'message': '請提供 refresh token',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({
            'status': 'success',
            'data': {
                'message': '已成功登出',
            },
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'error',
            'code': 'INVALID_TOKEN',
            'message': '無效的 refresh token',
        }, status=status.HTTP_400_BAD_REQUEST)

