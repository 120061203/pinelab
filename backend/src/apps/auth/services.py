"""
帳號管理服務
"""
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


def send_password_reset_email(email, token):
    """
    發送密碼重設郵件
    
    Args:
        email: 收件人郵箱
        token: 密碼重設 token
    """
    try:
        # 構建重設連結
        reset_url = f"{settings.FRONTEND_URL}/admin-portal/reset-password?token={token}&email={email}"
        
        # 渲染郵件模板
        context = {
            'reset_url': reset_url,
            'token': token,
            'email': email,
        }
        html_message = render_to_string('emails/password_reset.html', context)
        text_message = f"請點擊以下連結重設您的密碼: {reset_url}"
        
        # 發送郵件
        email_message = EmailMessage(
            subject='密碼重設通知',
            body=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_message.content_subtype = 'html'
        email_message.send()
        
        return True
    except Exception as e:
        # 記錄錯誤但不中斷流程
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send password reset email to {email}: {str(e)}")
        return False


def send_admin_deletion_notification_email(user, requested_by, deletion_date):
    """
    發送管理員刪除通知郵件（7天猶豫期）
    
    Args:
        user: 被刪除的管理員
        requested_by: 請求刪除的管理員
        deletion_date: 刪除日期（7天後）
    """
    try:
        # 構建取消刪除連結
        cancel_url = f"{settings.FRONTEND_URL}/admin-portal/users/{user.id}/cancel-deletion"
        
        # 渲染郵件模板
        context = {
            'user': user,
            'requested_by': requested_by,
            'deletion_date': deletion_date,
            'cancel_url': cancel_url,
        }
        html_message = render_to_string('emails/admin_deletion_notification.html', context)
        text_message = f"""
親愛的 {user.username}，

您的管理員帳號已被 {requested_by.username} 標記為刪除。
刪除日期：{deletion_date.strftime('%Y-%m-%d %H:%M:%S')}

如果您認為這是誤操作，請在 7 天內點擊以下連結取消刪除：
{cancel_url}

此致，
系統管理員
        """
        
        # 發送郵件
        email_message = EmailMessage(
            subject='管理員帳號刪除通知',
            body=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email] if user.email else [],
        )
        email_message.content_subtype = 'html'
        email_message.send()
        
        return True
    except Exception as e:
        # 記錄錯誤但不中斷流程
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send admin deletion notification email to {user.email}: {str(e)}")
        return False

