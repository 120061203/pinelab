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
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">我們的服務</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
            >
              {renderIcon(service) && (
                <div className="flex justify-center mb-4">
                  {renderIcon(service)}
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

