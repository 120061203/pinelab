"""
商品 Admin 介面
"""
from django.contrib import admin
from .models import Product, ProductImage, ProductTag


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image_url', 'sort_order', 'is_primary']


class ProductTagInline(admin.TabularInline):
    model = ProductTag
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'sort_order', 'is_active', 'created_at']
    list_filter = ['is_active', 'category', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductTagInline]
    ordering = ['-sort_order', '-updated_at']
    fieldsets = (
        ('基本資訊', {
            'fields': ('name', 'slug', 'description', 'category')
        }),
        ('價格與排序', {
            'fields': ('price', 'sort_order')
        }),
        ('狀態', {
            'fields': ('is_active',)
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image_url', 'is_primary', 'sort_order']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name']
    ordering = ['product', 'sort_order']


@admin.register(ProductTag)
class ProductTagAdmin(admin.ModelAdmin):
    list_display = ['product', 'tag']
    list_filter = ['tag']
    search_fields = ['product__name', 'tag__name']

