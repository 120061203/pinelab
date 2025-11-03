/**
 * 聯絡頁面
 */
'use client';

import { useState } from 'react';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">聯絡我們</h1>
      
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-600 mb-8">
          如果您有任何問題或建議，歡迎透過以下表單與我們聯絡，我們會儘快回覆您。
        </p>
        
        <ContactForm />
      </div>
    </div>
  );
}

