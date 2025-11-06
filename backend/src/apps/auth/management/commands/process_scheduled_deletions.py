"""
Django management command: 處理預定刪除的帳號
執行實際刪除操作（7天猶豫期後）
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from apps.auth.models import User
from apps.auth.services import send_admin_deletion_notification_email
import logging


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = '處理預定刪除的帳號（7天猶豫期後執行實際刪除）'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='僅顯示將要刪除的帳號，不執行實際刪除',
        )
        parser.add_argument(
            '--send-final-notice',
            action='store_true',
            help='在刪除前發送最後提醒郵件（24小時前）',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        send_final_notice = options['send_final_notice']
        
        # 查找所有已過猶豫期的預定刪除帳號
        now = timezone.now()
        scheduled_deletions = User.objects.filter(
            deletion_scheduled_at__isnull=False,
            deletion_scheduled_at__lte=now,
            is_active=True
        )
        
        count = scheduled_deletions.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('沒有需要處理的預定刪除帳號')
            )
            return
        
        self.stdout.write(
            self.style.WARNING(f'找到 {count} 個需要處理的預定刪除帳號')
        )
        
        # 處理 24 小時前的最後提醒
        if send_final_notice:
            from datetime import timedelta
            one_day_ago = now - timedelta(days=1)
            final_notice_users = User.objects.filter(
                deletion_scheduled_at__isnull=False,
                deletion_scheduled_at__gte=now,
                deletion_scheduled_at__lte=one_day_ago + timedelta(hours=1),
                is_active=True
            )
            
            for user in final_notice_users:
                if user.deletion_requested_by and user.email:
                    self.stdout.write(
                        f'發送最後提醒郵件給: {user.username} ({user.email})'
                    )
                    if not dry_run:
                        send_admin_deletion_notification_email(
                            user,
                            user.deletion_requested_by,
                            user.deletion_scheduled_at
                        )
        
        # 執行實際刪除
        deleted_count = 0
        for user in scheduled_deletions:
            self.stdout.write(
                f'處理帳號: {user.username} (ID: {user.id}, '
                f'預定刪除時間: {user.deletion_scheduled_at})'
            )
            
            if dry_run:
                self.stdout.write(
                    self.style.WARNING(f'  [DRY RUN] 將刪除帳號: {user.username}')
                )
                deleted_count += 1
            else:
                try:
                    with transaction.atomic():
                        # 記錄刪除操作
                        logger.info(
                            f'Deleting scheduled user: {user.username} (ID: {user.id}), '
                            f'requested by: {user.deletion_requested_by.username if user.deletion_requested_by else "N/A"}'
                        )
                        
                        # 執行硬刪除
                        user.delete()
                        deleted_count += 1
                        
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ 已刪除帳號: {user.username}')
                        )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ 刪除帳號失敗: {user.username} - {str(e)}')
                    )
                    logger.error(
                        f'Failed to delete scheduled user {user.username}: {str(e)}',
                        exc_info=True
                    )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'\n[DRY RUN] 將刪除 {deleted_count} 個帳號'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n成功處理 {deleted_count} 個預定刪除帳號'
                )
            )

