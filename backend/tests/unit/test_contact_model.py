"""
Contact 模型單元測試
"""
import pytest
from apps.contacts.models import Contact


@pytest.mark.django_db
class TestContactModel:
    """Contact 模型測試"""
    
    def test_create_contact(self):
        """測試建立聯絡表單"""
        contact = Contact.objects.create(
            name='測試使用者',
            email='test@example.com',
            message='這是一個測試訊息，長度超過10個字元'
        )
        
        assert contact.id is not None
        assert contact.name == '測試使用者'
        assert contact.email == 'test@example.com'
        assert contact.is_read is False
        assert contact.created_at is not None
    
    def test_contact_ordering(self):
        """測試聯絡表單排序（最新在前）"""
        contact1 = Contact.objects.create(
            name='使用者1',
            email='user1@example.com',
            message='訊息1，長度超過10個字元'
        )
        contact2 = Contact.objects.create(
            name='使用者2',
            email='user2@example.com',
            message='訊息2，長度超過10個字元'
        )
        
        contacts = list(Contact.objects.all())
        assert contacts[0].name == '使用者2'  # 最新在前
        assert contacts[1].name == '使用者1'
    
    def test_contact_str(self):
        """測試聯絡表單字串表示"""
        contact = Contact.objects.create(
            name='測試使用者',
            email='test@example.com',
            message='測試訊息，長度超過10個字元'
        )
        assert '測試使用者' in str(contact)
        assert 'test@example.com' in str(contact)

