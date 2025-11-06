"""
帳號管理 API Views（管理員專用）
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import User
from .admin_serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserSelfUpdateSerializer
)
from core.permissions import IsAdminUser, IsRoleAdmin


class UserAdminViewSet(viewsets.ModelViewSet):
    """
    帳號管理 ViewSet（管理員專用）
    支援完整 CRUD 操作，包含權限檢查
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsRoleAdmin]

    def get_permissions(self):
        """依 action 動態指定權限：
        - update_self, cancel_impersonation: 已登入即可
        - 其他：僅 admin 角色可用
        """
        if self.action in ['update_self', 'cancel_impersonation']:
            return [IsAuthenticated()]
        return [perm() for perm in self.permission_classes]
    
    def get_queryset(self):
        """管理員可以查看所有帳號"""
        queryset = super().get_queryset()
        
        # 搜尋功能
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # 角色篩選
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # 排序
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        return queryset.select_related('deletion_requested_by')
    
    def get_serializer_class(self):
        """根據操作選擇適當的序列化器"""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return UserUpdateSerializer
        elif self.action == 'update_self':
            return UserSelfUpdateSerializer
        return UserSerializer
    
    def create(self, request, *args, **kwargs):
        """建立帳號，統一響應格式並檢查權限"""
        # 權限檢查：編輯者不能新增管理員
        current_user = request.user
        role = request.data.get('role')
        is_super_admin = request.data.get('is_super_admin', False)
        
        # 檢查編輯者權限
        if hasattr(current_user, 'role') and current_user.role == 'editor':
            if role == 'admin':
                return Response({
                    'status': 'error',
                    'code': 'PERMISSION_DENIED',
                    'message': '編輯者不能新增管理員角色',
                }, status=status.HTTP_403_FORBIDDEN)
        
        # 檢查分析師權限
        if hasattr(current_user, 'role') and current_user.role == 'analyst':
            return Response({
                'status': 'error',
                'code': 'PERMISSION_DENIED',
                'message': '分析師不能新增任何帳號',
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 檢查主管理員唯一性
        if is_super_admin:
            existing = User.objects.filter(is_super_admin=True).exists()
            if existing:
                return Response({
                    'status': 'error',
                    'code': 'DUPLICATE_SUPER_ADMIN',
                    'message': '系統中只能有一位主管理員',
                }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({
                'status': 'success',
                'data': serializer.data,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # 處理驗證錯誤
            from rest_framework.exceptions import ValidationError
            if isinstance(e, ValidationError):
                # 格式化驗證錯誤
                error_messages = []
                if hasattr(e, 'detail'):
                    if isinstance(e.detail, dict):
                        for field, errors in e.detail.items():
                            if isinstance(errors, list):
                                error_messages.append(f"{field}: {', '.join(str(err) for err in errors)}")
                            else:
                                error_messages.append(f"{field}: {str(errors)}")
                    elif isinstance(e.detail, list):
                        error_messages = [str(err) for err in e.detail]
                    else:
                        error_messages = [str(e.detail)]
                
                return Response({
                    'status': 'error',
                    'code': 'VALIDATION_ERROR',
                    'message': '; '.join(error_messages) if error_messages else '驗證失敗',
                    'errors': e.detail if hasattr(e, 'detail') else str(e),
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 處理資料庫唯一性約束錯誤
            error_message = str(e)
            if 'unique' in error_message.lower() or 'already exists' in error_message.lower() or 'duplicate' in error_message.lower():
                if 'username' in error_message.lower() or 'users_username' in error_message.lower():
                    return Response({
                        'status': 'error',
                        'code': 'DUPLICATE_USERNAME',
                        'message': '使用者名稱已存在，請使用不同的使用者名稱',
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif 'email' in error_message.lower() or 'users_email' in error_message.lower():
                    return Response({
                        'status': 'error',
                        'code': 'DUPLICATE_EMAIL',
                        'message': '郵箱地址已存在，請使用不同的郵箱',
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'status': 'error',
                        'code': 'DUPLICATE',
                        'message': '資料已存在，請檢查輸入的資料',
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # 重新拋出其他異常
            raise
    
    def update(self, request, *args, **kwargs):
        """更新帳號，統一響應格式並檢查權限"""
        instance = self.get_object()
        current_user = request.user
        
        # T086: 僅允許主管理員修改主管理員
        if instance.is_super_admin and not current_user.is_super_admin:
            return Response({
                'status': 'error',
                'code': 'PERMISSION_DENIED',
                'message': '只有主管理員可以修改主管理員的帳號',
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 檢查編輯者權限
        if hasattr(current_user, 'role') and current_user.role == 'editor':
            # 編輯者不能將帳號改為管理員
            if request.data.get('role') == 'admin':
                return Response({
                    'status': 'error',
                    'code': 'PERMISSION_DENIED',
                    'message': '編輯者不能將帳號改為管理員角色',
                }, status=status.HTTP_403_FORBIDDEN)
            # 編輯者不能修改主管理員狀態
            if request.data.get('is_super_admin') is not None:
                return Response({
                    'status': 'error',
                    'code': 'PERMISSION_DENIED',
                    'message': '編輯者不能修改主管理員狀態',
                }, status=status.HTTP_403_FORBIDDEN)
        
        # 檢查分析師權限：只能更新自己的帳號
        if hasattr(current_user, 'role') and current_user.role == 'analyst':
            if instance.id != current_user.id:
                return Response({
                    'status': 'error',
                    'code': 'PERMISSION_DENIED',
                    'message': '分析師只能更新自己的帳號',
                }, status=status.HTTP_403_FORBIDDEN)
        
        # 檢查主管理員唯一性（如果嘗試設定新的主管理員）
        if request.data.get('is_super_admin') is True:
            existing = User.objects.filter(is_super_admin=True).exclude(pk=instance.pk).exists()
            if existing:
                return Response({
                    'status': 'error',
                    'code': 'DUPLICATE_SUPER_ADMIN',
                    'message': '系統中只能有一位主管理員',
                }, status=status.HTTP_400_BAD_REQUEST)
        
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'status': 'success',
            'data': serializer.data,
        })
    
    def destroy(self, request, *args, **kwargs):
        """刪除帳號，包含權限檢查和猶豫期處理"""
        instance = self.get_object()
        current_user = request.user
        
        # 檢查分析師權限
        if hasattr(current_user, 'role') and current_user.role == 'analyst':
            return Response({
                'status': 'error',
                'code': 'PERMISSION_DENIED',
                'message': '分析師不能刪除任何帳號',
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 檢查主管理員：不能被刪除
        if instance.is_super_admin:
            return Response({
                'status': 'error',
                'code': 'CANNOT_DELETE_SUPER_ADMIN',
                'message': '主管理員不能被刪除',
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 管理員刪除管理員：進入7天猶豫期
        if hasattr(instance, 'role') and instance.role == 'admin' and hasattr(current_user, 'role') and current_user.role == 'admin':
            # 設定猶豫期
            instance.deletion_scheduled_at = timezone.now() + timedelta(days=7)
            instance.deletion_requested_by = current_user
            instance.save()
            
            # 發送通知郵件
            from .services import send_admin_deletion_notification_email
            send_admin_deletion_notification_email(
                instance,
                current_user,
                instance.deletion_scheduled_at
            )
            
            return Response({
                'status': 'success',
                'data': {
                    'message': '帳號已標記為刪除，7天猶豫期後將自動刪除',
                    'deletion_scheduled_at': instance.deletion_scheduled_at.isoformat(),
                },
            }, status=status.HTTP_200_OK)
        
        # 其他情況：立即刪除（軟刪除或硬刪除）
        instance.delete()
        return Response({
            'status': 'success',
            'data': {
                'message': '帳號已刪除',
            },
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def cancel_deletion(self, request, pk=None):
        """取消刪除（僅猶豫期內可用）"""
        user = self.get_object()
        
        if not user.deletion_scheduled_at:
            return Response({
                'status': 'error',
                'code': 'NO_DELETION_SCHEDULED',
                'message': '此帳號沒有預定刪除',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 檢查是否在猶豫期內
        if timezone.now() > user.deletion_scheduled_at:
            return Response({
                'status': 'error',
                'code': 'DELETION_PERIOD_EXPIRED',
                'message': '猶豫期已過，無法取消刪除',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 取消刪除
        requested_by = user.deletion_requested_by
        user.deletion_scheduled_at = None
        user.deletion_requested_by = None
        user.save()
        
        # 發送取消刪除通知郵件
        if requested_by and user.email:
            from .services import send_admin_deletion_notification_email
            # 發送取消通知（使用同一郵件服務，但可以擴展為專門的取消通知郵件）
            # 這裡可以發送一個簡單的取消通知
            try:
                from django.core.mail import EmailMessage
                from django.conf import settings
                email_message = EmailMessage(
                    subject='帳號刪除已取消',
                    body=f'您的帳號刪除請求已被取消。帳號 {user.username} 將繼續保留。',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email],
                )
                email_message.send()
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send cancellation email to {user.email}: {str(e)}")
        
        return Response({
            'status': 'success',
            'data': {
                'message': '刪除已取消',
            },
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['put'], url_path='me')
    def update_self(self, request):
        """更新自己的帳號資訊（所有角色可用）"""
        user = request.user
        serializer = UserSelfUpdateSerializer(user, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'status': 'success',
            'data': UserSerializer(user).data,
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def impersonate(self, request, pk=None):
        """切換身份模擬其他角色（僅管理員可用）"""
        # 檢查是否為管理員
        if not hasattr(request.user, 'role') or request.user.role != 'admin':
            return Response({
                'status': 'error',
                'code': 'PERMISSION_DENIED',
                'message': '只有管理員可以使用身份切換功能',
            }, status=status.HTTP_403_FORBIDDEN)
        
        target_user = self.get_object()
        
        # 管理員不能模擬管理員
        if target_user.role == 'admin':
            return Response({
                'status': 'error',
                'code': 'CANNOT_IMPERSONATE_ADMIN',
                'message': '不能模擬管理員角色',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 獲取要模擬的角色（如果沒有指定，使用目標使用者的角色）
        impersonate_role = request.data.get('role', target_user.role)
        
        if impersonate_role not in ['editor', 'analyst']:
            return Response({
                'status': 'error',
                'code': 'INVALID_ROLE',
                'message': '只能模擬編輯者或分析師角色',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 生成帶有身份切換信息的 JWT token
        from .tokens import ImpersonationRefreshToken
        original_user = request.user
        
        # 使用目標使用者生成 token，但添加原始管理員信息
        token = ImpersonationRefreshToken.for_user_with_impersonation(
            target_user,
            impersonate_role=impersonate_role,
            original_user_id=original_user.id
        )
        
        # 獲取使用者信息
        from .admin_serializers import UserSerializer
        user_serializer = UserSerializer(target_user)
        
        return Response({
            'status': 'success',
            'data': {
                'access': str(token.access_token),
                'refresh': str(token),
                'user': user_serializer.data,
                'impersonation': {
                    'is_impersonating': True,
                    'impersonate_role': impersonate_role,
                    'original_user': {
                        'id': original_user.id,
                        'username': original_user.username,
                    },
                },
            },
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='impersonate-role')
    def impersonate_role(self, request):
        """
        無需指定用戶，直接以指定角色（editor/analyst）進行身份切換（僅管理員可用）
        POST /api/admin/users/impersonate-role/
        body: { "role": "editor" | "analyst" }
        """
        current_user = request.user
        # 僅限管理員使用
        if not hasattr(current_user, 'role') or current_user.role != 'admin':
            return Response({
                'status': 'error',
                'code': 'PERMISSION_DENIED',
                'message': '只有管理員可以使用身份切換功能',
            }, status=status.HTTP_403_FORBIDDEN)

        impersonate_role = request.data.get('role')
        if impersonate_role not in ['editor', 'analyst']:
            return Response({
                'status': 'error',
                'code': 'INVALID_ROLE',
                'message': '只能切換為編輯者或分析師角色',
            }, status=status.HTTP_400_BAD_REQUEST)

        # 基於當前管理員生成帶有 impersonate_role 的 token
        from .tokens import ImpersonationRefreshToken
        token = ImpersonationRefreshToken.for_user_with_impersonation(
            current_user,
            impersonate_role=impersonate_role,
            original_user_id=current_user.id,
        )

        from .admin_serializers import UserSerializer
        user_serializer = UserSerializer(current_user)

        return Response({
            'status': 'success',
            'data': {
                'access': str(token.access_token),
                'refresh': str(token),
                'user': user_serializer.data,
                'impersonation': {
                    'is_impersonating': True,
                    'impersonate_role': impersonate_role,
                    'original_user': {
                        'id': current_user.id,
                        'username': current_user.username,
                    },
                },
            },
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='cancel-impersonation')
    def cancel_impersonation(self, request):
        """取消身份切換（返回原始管理員身份）"""
        # 檢查是否正在模擬（從 token 中獲取 original_user_id）
        # 注意：這裡需要從 JWT token 中解析出 original_user_id
        # 如果沒有 original_user_id，說明沒有在模擬
        try:
            # 從 JWT token 中獲取 claims
            from rest_framework_simplejwt.tokens import UntypedToken
            from rest_framework_simplejwt.exceptions import InvalidToken
            
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                return Response({
                    'status': 'error',
                    'code': 'NO_TOKEN',
                    'message': '未提供認證 token',
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            token_string = auth_header.split(' ')[1]
            try:
                untyped_token = UntypedToken(token_string)
            except Exception:
                return Response({
                    'status': 'error',
                    'code': 'INVALID_TOKEN',
                    'message': '無效的認證 token',
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            original_user_id = untyped_token.get('original_user_id')
            
            if not original_user_id:
                return Response({
                    'status': 'error',
                    'code': 'NOT_IMPERSONATING',
                    'message': '當前沒有進行身份切換',
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 獲取原始管理員
            try:
                original_user = User.objects.get(id=original_user_id, role='admin')
            except User.DoesNotExist:
                return Response({
                    'status': 'error',
                    'code': 'ORIGINAL_USER_NOT_FOUND',
                    'message': '找不到原始管理員帳號',
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 生成原始管理員的 token（不帶身份切換信息）
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken.for_user(original_user)
            
            from .admin_serializers import UserSerializer
            user_serializer = UserSerializer(original_user)
            
            return Response({
                'status': 'success',
                'data': {
                    'access': str(token.access_token),
                    'refresh': str(token),
                    'user': user_serializer.data,
                    'impersonation': {
                        'is_impersonating': False,
                    },
                },
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in cancel_impersonation: {str(e)}", exc_info=True)
            return Response({
                'status': 'error',
                'code': 'INTERNAL_ERROR',
                'message': '取消身份切換時發生錯誤',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='send-password-reset')
    def send_password_reset(self, request, pk=None):
        """
        T087: 代發密碼重設信端點（僅管理員可用）
        POST /api/admin/users/{id}/send-password-reset/
        """
        user = self.get_object()
        current_user = request.user
        
        # 檢查權限：僅管理員可用
        if not hasattr(current_user, 'role') or current_user.role != 'admin':
            return Response({
                'status': 'error',
                'code': 'PERMISSION_DENIED',
                'message': '只有管理員可以代發密碼重設信',
            }, status=status.HTTP_403_FORBIDDEN)
        
        # 檢查用戶是否有有效的郵箱
        if not user.email:
            return Response({
                'status': 'error',
                'code': 'NO_EMAIL',
                'message': '該使用者沒有設定郵箱地址',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 生成 token
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        
        # 發送郵件
        from .services import send_password_reset_email
        success = send_password_reset_email(user.email, token)
        
        if success:
            return Response({
                'status': 'success',
                'data': {
                    'message': f'密碼重設信已發送到 {user.email}',
                },
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': 'error',
                'code': 'EMAIL_SEND_FAILED',
                'message': '發送郵件失敗，請檢查郵件服務配置',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

