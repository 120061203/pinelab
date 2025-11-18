/**
 * 服務項目區塊元件
 */
'use client';

import { Service } from '@/types/service';
import Image from 'next/image';

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  if (!services || services.length === 0) {
    return null;
  }

  const renderIcon = (service: Service) => {
    if (!service.icon_type || !service.icon_value) {
      return null;
    }

    if (service.icon_type === 'custom') {
      // 自訂圖標：顯示圖片
      return service.icon_value.startsWith('http') ? (
        <img
          src={service.icon_value}
          alt={service.title}
          className="w-12 h-12 object-contain"
        />
      ) : (
        <Image
          src={service.icon_value}
          alt={service.title}
          width={48}
          height={48}
          className="object-contain"
        />
      );
    }

    // 內建圖標字體：使用對應的圖標庫
    if (service.icon_type === 'fontawesome') {
      // Font Awesome 圖標名稱格式：fa-home, fa-user 等
      const iconClass = service.icon_value?.startsWith('fa-') 
        ? service.icon_value 
        : `fa-${service.icon_value}`;
      return (
        <i className={`fa ${iconClass} text-4xl text-blue-600`} />
      );
    }

    if (service.icon_type === 'material') {
      return (
        <span className="material-icons text-4xl text-blue-600">
          {service.icon_value}
        </span>
      );
    }

    return null;
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">我們的服務</h2>
          <div className="w-24 h-1 bg-gray-900 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg border border-gray-100 p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-center group"
            >
              {renderIcon(service) && (
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors">
                    {renderIcon(service)}
                  </div>
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

