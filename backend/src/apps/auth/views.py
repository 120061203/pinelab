"""
認證 Views
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from core.permissions import IsAdminUser
from .models import User


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
    
    # 返回使用者資訊，包含 role 和 is_super_admin
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }
    
    # 添加角色相關資訊（如果 User 模型有這些欄位）
    if hasattr(user, 'role'):
        user_data['role'] = user.role
        user_data['role_display'] = user.get_role_display()
    if hasattr(user, 'is_super_admin'):
        user_data['is_super_admin'] = user.is_super_admin
    
    return Response({
        'status': 'success',
        'data': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data,
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


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    密碼重設請求端點
    接收 email，生成重設 token，發送郵件
    """
    email = request.data.get('email')
    
    if not email:
        return Response({
            'status': 'error',
            'code': 'MISSING_EMAIL',
            'message': '請提供郵箱地址',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        # 為了安全，不洩露 email 是否存在
        return Response({
            'status': 'success',
            'data': {
                'message': '如果該郵箱存在，我們已發送密碼重設連結',
            },
        }, status=status.HTTP_200_OK)
    
    # 生成 token
    token_generator = PasswordResetTokenGenerator()
    token = token_generator.make_token(user)
    
    # 發送郵件
    from .services import send_password_reset_email
    send_password_reset_email(user.email, token)
    
    return Response({
        'status': 'success',
        'data': {
            'message': '如果該郵箱存在，我們已發送密碼重設連結',
            # 開發環境可以返回 token 用於測試
            'token': token if request.user.is_authenticated and request.user.is_superuser else None,
        },
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    密碼重設確認端點
    接收 token、email、新密碼，驗證並更新
    """
    token = request.data.get('token')
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    
    if not all([token, email, new_password]):
        return Response({
            'status': 'error',
            'code': 'MISSING_FIELDS',
            'message': '請提供 token、email 和新密碼',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'code': 'USER_NOT_FOUND',
            'message': '找不到該使用者',
        }, status=status.HTTP_404_NOT_FOUND)
    
    # 驗證 token
    token_generator = PasswordResetTokenGenerator()
    if not token_generator.check_token(user, token):
        return Response({
            'status': 'error',
            'code': 'INVALID_TOKEN',
            'message': '無效或已過期的重設 token',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 驗證密碼強度
    try:
        from django.contrib.auth.password_validation import validate_password
        validate_password(new_password, user)
    except Exception as e:
        return Response({
            'status': 'error',
            'code': 'WEAK_PASSWORD',
            'message': f'密碼不符合要求: {"; ".join(str(err) for err in e.messages)}',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 更新密碼
    user.set_password(new_password)
    user.save()
    
    return Response({
        'status': 'success',
        'data': {
            'message': '密碼已成功重設',
        },
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    使用者自行重設密碼端點
    需要 JWT 認證，接收舊密碼、新密碼
    """
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not all([old_password, new_password]):
        return Response({
            'status': 'error',
            'code': 'MISSING_FIELDS',
            'message': '請提供舊密碼和新密碼',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    # 驗證舊密碼
    if not user.check_password(old_password):
        return Response({
            'status': 'error',
            'code': 'INVALID_OLD_PASSWORD',
            'message': '舊密碼不正確',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 驗證新密碼強度
    try:
        from django.contrib.auth.password_validation import validate_password
        validate_password(new_password, user)
    except Exception as e:
        return Response({
            'status': 'error',
            'code': 'WEAK_PASSWORD',
            'message': f'密碼不符合要求: {"; ".join(str(err) for err in e.messages)}',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 更新密碼
    user.set_password(new_password)
    user.save()
    
    return Response({
        'status': 'success',
        'data': {
            'message': '密碼已成功變更',
        },
    }, status=status.HTTP_200_OK)

