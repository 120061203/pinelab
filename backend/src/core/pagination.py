"""
自訂分頁類別
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    標準分頁器
    統一回應格式：{'status': 'success', 'data': {'count': ..., 'results': ...}}
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """返回統一格式的分頁回應"""
        return Response({
            'status': 'success',
            'data': {
                'count': self.page.paginator.count,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'results': data,
            },
        })

