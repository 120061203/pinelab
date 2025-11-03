"""
聯絡表單 Admin 介面
"""
from django.contrib import admin
from .models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['created_at']
    list_editable = ['is_read']
    ordering = ['-created_at']
    fieldsets = (
        ('聯絡資訊', {
            'fields': ('name', 'email')
        }),
        ('訊息內容', {
            'fields': ('message',)
        }),
        ('狀態', {
            'fields': ('is_read', 'created_at')
        }),
    )

