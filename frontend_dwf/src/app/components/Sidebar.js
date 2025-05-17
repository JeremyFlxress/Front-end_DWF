'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Principal', path: '/dashboard', icon: 'home' },
    { name: 'Prestamo', path: '/prestamo', icon: 'book-open' },
    { name: 'Catalogo', path: '/catalogo', icon: 'list' },
    { name: 'Libros Activos', path: '/librosactivos', icon: 'book' },
    { name: 'Registro General', path: '/registro', icon: 'clipboard' },
    { name: 'Reportes', path: '/reportes', icon: 'file-text' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <Image 
          src="/logosinrayas.png" 
          alt="Logo ¡SUPÉRATE!" 
          width={150} 
          height={80}
          priority
        />
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <Link 
            href={item.path} 
            key={item.path}
            className={`sidebar-item ${pathname === item.path ? 'active' : ''}`}
          >
            <div className="sidebar-icon">
              {getIcon(item.icon)}
            </div>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

// Función para generar los iconos (simplificada para el ejemplo)
const getIcon = (iconName) => {
  // Aquí podrías usar una librería de iconos como react-icons
  // Por ahora usamos emojis como placeholder
  const icons = {
    'home': <span>🏠</span>,
    'book-open': <span>📖</span>,
    'list': <span>📋</span>,
    'book': <span>📚</span>,
    'clipboard': <span>📝</span>,
    'file-text': <span>📄</span>,
  };
  
  return icons[iconName] || <span>•</span>;
};

export default Sidebar;