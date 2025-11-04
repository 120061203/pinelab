"""
商品管理 API Views（管理員專用）
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product
from .admin_serializers import ProductAdminSerializer
from .image_handler import validate_image_url, clean_image_url
from core.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from apps.categories.models import Category
from apps.tags.models import Tag
from apps.contacts.models import Contact


class ProductAdminViewSet(viewsets.ModelViewSet):
    """
    商品管理 ViewSet（管理員專用）
    支援完整 CRUD 操作，包括未啟用商品
    """
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """管理員可以查看所有商品"""
        queryset = super().get_queryset()
        queryset = queryset.prefetch_related('tags', 'images').select_related('category')
        return queryset
    
    def create(self, request, *args, **kwargs):
        """建立商品，統一響應格式"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """更新商品，統一響應格式"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """刪除商品，統一響應格式"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'status': 'success',
            'data': {'message': '商品已刪除'},
        }, status=status.HTTP_200_OK)
    
    def list(self, request, *args, **kwargs):
        """列表查詢，統一響應格式"""
        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data.get('results', []) if isinstance(response.data, dict) and 'results' in response.data else response.data,
                'count': response.data.get('count', len(response.data)) if isinstance(response.data, dict) else len(response.data) if isinstance(response.data, list) else 0,
                'next': response.data.get('next') if isinstance(response.data, dict) else None,
                'previous': response.data.get('previous') if isinstance(response.data, dict) else None,
            })
        return response
    
    def retrieve(self, request, *args, **kwargs):
        """單一查詢，統一響應格式"""
        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'status': 'success',
                'data': response.data,
            })
        return response
    
    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        """
        上傳商品圖片
        支援兩種方式：
        1. 檔案上傳（FormData，key 為 'file'）
        2. 圖片 URL（JSON，key 為 'image_url'）
        """
        import os
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        from django.conf import settings
        
        product = self.get_object()
        sort_order = int(request.data.get('sort_order', 0))
        is_primary = request.data.get('is_primary', False) in (True, 'true', 'True', '1', 1)
        
        # 優先處理檔案上傳
        uploaded_file = request.FILES.get('file')
        image_url = None
        
        if uploaded_file:
            # 檔案上傳：儲存檔案並生成 URL
            # 驗證檔案類型
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            file_ext = os.path.splitext(uploaded_file.name)[1].lower()
            if file_ext not in allowed_extensions:
                return Response({
                    'status': 'error',
                    'code': 'INVALID_FILE_TYPE',
                    'message': f'不支援的檔案類型。允許的格式：{", ".join(allowed_extensions)}',
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 驗證檔案大小（最大 5MB）
            max_size = 5 * 1024 * 1024  # 5MB
            if uploaded_file.size > max_size:
                return Response({
                    'status': 'error',
                    'code': 'FILE_TOO_LARGE',
                    'message': '檔案大小不能超過 5MB',
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 生成儲存路徑：media/products/{product_id}/{filename}
            product_dir = f'products/{product.id}'
            # 使用東8區時間戳記生成檔名（所有檔案都加上時間戳）
            from django.utils import timezone
            import time
            # 取得東8區當前時間
            tz_utc8 = timezone.get_fixed_timezone(480)  # UTC+8 = 480 分鐘
            now_utc8 = timezone.now().astimezone(tz_utc8)
            # 生成時間戳記格式：YYYYMMDD_HHMMSS
            timestamp = now_utc8.strftime('%Y%m%d_%H%M%S')
            # 在檔名中加入時間戳記
            name, ext = os.path.splitext(os.path.basename(uploaded_file.name))
            filename = f'{name}_{timestamp}{ext}'
            
            file_path = default_storage.save(
                f'{product_dir}/{filename}',
                ContentFile(uploaded_file.read())
            )
            
            # 生成相對路徑 URL
            image_url = f'/media/{file_path}'
        
        elif request.data.get('image_url'):
            # 使用提供的圖片 URL
            image_url = request.data.get('image_url')
            # 驗證並清理圖片 URL
            from .image_handler import clean_image_url, validate_image_url
            cleaned_url = clean_image_url(image_url)
            if not validate_image_url(cleaned_url):
                return Response({
                    'status': 'error',
                    'code': 'INVALID_IMAGE_URL',
                    'message': '無效的圖片 URL 格式',
                }, status=status.HTTP_400_BAD_REQUEST)
            image_url = cleaned_url
        else:
            # 兩種方式都沒有提供
            return Response({
                'status': 'error',
                'code': 'MISSING_IMAGE',
                'message': '請提供圖片檔案或圖片 URL',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 建立 ProductImage 記錄
        from .models import ProductImage
        # 如果設定為主圖，先取消其他主圖
        if is_primary:
            ProductImage.objects.filter(product=product, is_primary=True).update(is_primary=False)
        
        image = ProductImage.objects.create(
            product=product,
            image_url=image_url,
            sort_order=sort_order,
            is_primary=is_primary
        )
        
        serializer = self.get_serializer(product)
        return Response({
            'status': 'success',
            'data': serializer.data,
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[0-9]+)')
    def delete_image(self, request, pk=None, image_id=None):
        """
        刪除商品圖片
        """
        product = self.get_object()
        
        try:
            image = product.images.get(id=image_id)
            image.delete()
            
            return Response({
                'status': 'success',
                'data': {'message': '圖片已刪除'},
            }, status=status.HTTP_200_OK)
        except product.images.model.DoesNotExist:
            return Response({
                'status': 'error',
                'code': 'IMAGE_NOT_FOUND',
                'message': '圖片不存在',
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], url_path='images/batch_update_sort')
    def batch_update_image_sort(self, request, pk=None):
        """
        批量更新商品圖片排序
        接收格式: { "items": [{"id": 1, "sort_order": 10}, {"id": 2, "sort_order": 20}] }
        """
        product = self.get_object()
        items = request.data.get('items', [])
        if not isinstance(items, list):
            return Response({
                'status': 'error',
                'code': 'INVALID_FORMAT',
                'message': 'items 必須是陣列',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from .models import ProductImage
            # 批量更新
            updates = []
            for item in items:
                image_id = item.get('id')
                sort_order = item.get('sort_order')
                
                if image_id is None or sort_order is None:
                    continue
                
                try:
                    image = product.images.get(id=image_id)
                    image.sort_order = sort_order
                    image.save(update_fields=['sort_order'])
                    updates.append({'id': image_id, 'sort_order': sort_order})
                except ProductImage.DoesNotExist:
                    continue
            
            serializer = self.get_serializer(product)
            return Response({
                'status': 'success',
                'data': {
                    'updated_count': len(updates),
                    'items': updates,
                    'product': serializer.data,
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'code': 'UPDATE_FAILED',
                'message': f'批量更新失敗: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='set_primary_image')
    def set_primary_image(self, request, pk=None):
        """
        設定商品主圖
        從請求 body 中取得 image_id
        """
        product = self.get_object()
        image_id = request.data.get('image_id')
        
        if not image_id:
            return Response({
                'status': 'error',
                'code': 'MISSING_IMAGE_ID',
                'message': '請提供圖片 ID',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            image_id = int(image_id)
            image = product.images.get(id=image_id)
            # 先取消其他主圖
            product.images.filter(is_primary=True).update(is_primary=False)
            # 設定當前圖片為主圖
            image.is_primary = True
            image.save()
            
            serializer = self.get_serializer(product)
            return Response({
                'status': 'success',
                'data': serializer.data,
            }, status=status.HTTP_200_OK)
        except (ValueError, TypeError):
            return Response({
                'status': 'error',
                'code': 'INVALID_IMAGE_ID',
                'message': '無效的圖片 ID',
            }, status=status.HTTP_400_BAD_REQUEST)
        except product.images.model.DoesNotExist:
            return Response({
                'status': 'error',
                'code': 'IMAGE_NOT_FOUND',
                'message': '圖片不存在',
            }, status=status.HTTP_404_NOT_FOUND)


    @action(detail=False, methods=['post'], url_path='batch_update_sort')
    def batch_update_sort(self, request):
        """
        批量更新商品排序
        接收格式: { "items": [{"id": 1, "sort_order": 10}, {"id": 2, "sort_order": 20}] }
        """
        items = request.data.get('items', [])
        if not isinstance(items, list):
            return Response({
                'status': 'error',
                'code': 'INVALID_FORMAT',
                'message': 'items 必須是陣列',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 批量更新
            updates = []
            for item in items:
                product_id = item.get('id')
                sort_order = item.get('sort_order')
                
                if product_id is None or sort_order is None:
                    continue
                
                try:
                    product = Product.objects.get(id=product_id)
                    product.sort_order = sort_order
                    product.save(update_fields=['sort_order'])
                    updates.append({'id': product_id, 'sort_order': sort_order})
                except Product.DoesNotExist:
                    continue
            
            return Response({
                'status': 'success',
                'data': {
                    'updated_count': len(updates),
                    'items': updates,
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'code': 'UPDATE_FAILED',
                'message': f'批量更新失敗: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='batch_update_category')
    def batch_update_category(self, request):
        """
        批量更新商品分類
        接收格式: { "product_ids": [1, 2, 3], "category_id": 5 } 或 { "product_ids": [1, 2, 3], "category_id": null }
        """
        product_ids = request.data.get('product_ids', [])
        category_id = request.data.get('category_id')
        
        if not isinstance(product_ids, list) or len(product_ids) == 0:
            return Response({
                'status': 'error',
                'code': 'INVALID_FORMAT',
                'message': 'product_ids 必須是非空陣列',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from apps.categories.models import Category
            # 如果 category_id 不是 None，驗證分類存在
            category = None
            if category_id is not None:
                try:
                    category = Category.objects.get(id=category_id)
                except Category.DoesNotExist:
                    return Response({
                        'status': 'error',
                        'code': 'CATEGORY_NOT_FOUND',
                        'message': f'分類 ID {category_id} 不存在',
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # 批量更新商品分類
            updated_count = Product.objects.filter(id__in=product_ids).update(category=category)
            
            return Response({
                'status': 'success',
                'data': {
                    'updated_count': updated_count,
                    'product_ids': product_ids,
                    'category_id': category_id,
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'code': 'UPDATE_FAILED',
                'message': f'批量更新失敗: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='batch_update_tags')
    def batch_update_tags(self, request):
        """
        批量更新商品標籤
        接收格式: { "product_ids": [1, 2, 3], "operation": "add|remove|replace", "tag_ids": [5, 6] }
        """
        product_ids = request.data.get('product_ids', [])
        operation = request.data.get('operation', 'replace')
        tag_ids = request.data.get('tag_ids', [])
        
        if not isinstance(product_ids, list) or len(product_ids) == 0:
            return Response({
                'status': 'error',
                'code': 'INVALID_FORMAT',
                'message': 'product_ids 必須是非空陣列',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if operation not in ['add', 'remove', 'replace']:
            return Response({
                'status': 'error',
                'code': 'INVALID_OPERATION',
                'message': 'operation 必須是 add、remove 或 replace',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not isinstance(tag_ids, list):
            tag_ids = []
        
        try:
            from apps.tags.models import Tag
            # 驗證標籤存在
            if tag_ids:
                existing_tags = Tag.objects.filter(id__in=tag_ids)
                existing_tag_ids = set(existing_tags.values_list('id', flat=True))
                missing_tag_ids = set(tag_ids) - existing_tag_ids
                if missing_tag_ids:
                    return Response({
                        'status': 'error',
                        'code': 'TAGS_NOT_FOUND',
                        'message': f'標籤 ID {list(missing_tag_ids)} 不存在',
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # 取得要更新的商品
            products = Product.objects.filter(id__in=product_ids)
            updated_count = 0
            
            for product in products:
                if operation == 'add':
                    # 添加標籤（不重複）
                    product.tags.add(*tag_ids)
                elif operation == 'remove':
                    # 移除標籤
                    product.tags.remove(*tag_ids)
                elif operation == 'replace':
                    # 替換標籤
                    product.tags.set(tag_ids)
                updated_count += 1
            
            return Response({
                'status': 'success',
                'data': {
                    'updated_count': updated_count,
                    'product_ids': product_ids,
                    'operation': operation,
                    'tag_ids': tag_ids,
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'code': 'UPDATE_FAILED',
                'message': f'批量更新失敗: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='batch_update_status')
    def batch_update_status(self, request):
        """
        批量更新商品狀態
        接收格式: { "product_ids": [1, 2, 3], "operation": "enable|disable|delete" }
        操作類型：
        - enable: 啟用商品（設定 is_active=True）
        - disable: 停用商品（設定 is_active=False）
        - delete: 批量刪除商品
        """
        product_ids = request.data.get('product_ids', [])
        operation = request.data.get('operation', '')
        
        if not isinstance(product_ids, list) or len(product_ids) == 0:
            return Response({
                'status': 'error',
                'code': 'INVALID_PRODUCT_IDS',
                'message': '請提供有效的商品 ID 列表',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if operation not in ['enable', 'disable', 'delete']:
            return Response({
                'status': 'error',
                'code': 'INVALID_OPERATION',
                'message': '操作類型必須是 enable、disable 或 delete',
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 獲取商品
            products = self.get_queryset().filter(id__in=product_ids)
            if not products.exists():
                return Response({
                    'status': 'error',
                    'code': 'NO_PRODUCTS_FOUND',
                    'message': '找不到指定的商品',
                }, status=status.HTTP_404_NOT_FOUND)
            
            updated_count = 0
            
            if operation == 'enable':
                # 批量啟用
                updated_count = products.update(is_active=True)
            elif operation == 'disable':
                # 批量停用
                updated_count = products.update(is_active=False)
            elif operation == 'delete':
                # 批量刪除
                updated_count = products.count()
                products.delete()
            
            return Response({
                'status': 'success',
                'data': {
                    'updated_count': updated_count,
                    'operation': operation,
                },
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'code': 'UPDATE_FAILED',
                'message': f'批量更新失敗: {str(e)}',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_metrics(request):
    """
    Dashboard 指標（30 天）
    - totals: 商品、分類、標籤、未讀聯絡數
    - trends: 商品建立/聯絡提交（每日）
    - health: 無圖片/未分類/標籤覆蓋率
    """
    # totals
    totals = {
        'products': Product.objects.count(),
        'categories': Category.objects.count(),
        'tags': Tag.objects.count(),
        'contacts_unread': Contact.objects.filter(is_read=False).count(),
    }

    # 30 天區間
    days = int(request.GET.get('range', '30').rstrip('d') or 30)
    end = timezone.now().date()
    start = end - timedelta(days=days-1)

    # trends（簡化：以 created_at 日期聚合）
    def series(model):
        qs = model.objects.filter(created_at__date__gte=start, created_at__date__lte=end)
        by_day = qs.extra({'d': "date(created_at)"}).values('d').annotate(c=Count('id'))
        mapping = {str(x['d']): x['c'] for x in by_day}
        arr = []
        cur = start
        while cur <= end:
            arr.append(mapping.get(str(cur), 0))
            cur += timedelta(days=1)
        return arr[-10:]  # 限制長度避免 payload 過大

    trends = {
        'products_created_daily': series(Product),
        'contacts_created_daily': series(Contact),
    }

    # health
    products_no_image = Product.objects.filter(images__isnull=True).count()
    products_no_category = Product.objects.filter(category__isnull=True).count()
    total_products = totals['products'] or 1
    with_tag = Product.objects.filter(tags__isnull=False).distinct().count()
    health = {
        'products_no_image': products_no_image,
        'products_no_category': products_no_category,
        'products_tag_coverage_ratio': with_tag / float(total_products),
    }

    return Response({
        'status': 'success',
        'data': {
            'totals': totals,
            'trends': trends,
            'health': health,
        }
    })
