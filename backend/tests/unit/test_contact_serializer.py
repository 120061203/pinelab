"""
Contact Serializer 測試
"""
import pytest
from apps.contacts.models import Contact
from apps.contacts.serializers import ContactSerializer


@pytest.mark.django_db
class TestContactSerializer:
    """Contact Serializer 測試"""
    
    def test_serialize_contact(self):
        """測試序列化聯絡表單"""
        contact = Contact.objects.create(
            name='測試使用者',
            email='test@example.com',
            message='這是一個測試訊息，長度超過10個字元'
        )
        
        serializer = ContactSerializer(contact)
        data = serializer.data
        
        assert data['id'] == contact.id
        assert data['name'] == '測試使用者'
        assert data['email'] == 'test@example.com'
        assert data['message'] == '這是一個測試訊息，長度超過10個字元'
        assert data['is_read'] is False
        assert 'created_at' in data
    
    def test_validate_name_too_short(self):
        """測試姓名長度驗證（太短）"""
        serializer = ContactSerializer(data={
            'name': 'A',
            'email': 'test@example.com',
            'message': '這是一個測試訊息，長度超過10個字元'
        })
        
        assert not serializer.is_valid()
        assert 'name' in serializer.errors
    
    def test_validate_name_too_long(self):
        """測試姓名長度驗證（太長）"""
        serializer = ContactSerializer(data={
            'name': 'A' * 101,
            'email': 'test@example.com',
            'message': '這是一個測試訊息，長度超過10個字元'
        })
        
        assert not serializer.is_valid()
        assert 'name' in serializer.errors
    
    def test_validate_message_too_short(self):
        """測試訊息長度驗證（太短）"""
        serializer = ContactSerializer(data={
            'name': '測試使用者',
            'email': 'test@example.com',
            'message': '短訊息'
        })
        
        assert not serializer.is_valid()
        assert 'message' in serializer.errors
    
    def test_validate_message_too_long(self):
        """測試訊息長度驗證（太長）"""
        serializer = ContactSerializer(data={
            'name': '測試使用者',
            'email': 'test@example.com',
            'message': 'A' * 2001
        })
        
        assert not serializer.is_valid()
        assert 'message' in serializer.errors
    
    def test_create_contact_via_serializer(self):
        """測試透過序列化器建立聯絡表單"""
        serializer = ContactSerializer(data={
            'name': '新使用者',
            'email': 'newuser@example.com',
            'message': '這是一個新的測試訊息，長度超過10個字元'
        })
        
        assert serializer.is_valid()
        contact = serializer.save()
        
        assert contact.name == '新使用者'
        assert contact.is_read is False

