# Generated migration for User model role fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('custom_auth', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('admin', '管理員'), ('editor', '編輯者'), ('analyst', '分析師')],
                default='editor',
                max_length=20,
                verbose_name='角色'
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='is_super_admin',
            field=models.BooleanField(
                default=False,
                help_text='系統中只能有一位主管理員',
                verbose_name='主管理員'
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='deletion_scheduled_at',
            field=models.DateTimeField(
                blank=True,
                help_text='用於7天猶豫期管理',
                null=True,
                verbose_name='刪除預定時間'
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='deletion_requested_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='deletion_requests',
                to='auth.user',
                verbose_name='刪除請求者'
            ),
        ),
        migrations.AddConstraint(
            model_name='user',
            constraint=models.UniqueConstraint(
                condition=models.Q(('is_super_admin', True)),
                fields=['is_super_admin'],
                name='unique_super_admin'
            ),
        ),
    ]

