'use client';
import React from 'react';
import Image from 'next/image';

const Header = ({ title = "Sistema de Biblioteca", username = "Admin" }) => {
  return (
    <header className="main-header">
      <div className="header-title">
        <h1>{title}</h1>
      </div>
      
      <div className="user-profile">
        <div className="user-avatar">
          <Image 
            src="/usuario.png"
            alt="User Avatar"
            width={32}
            height={32}
            className="avatar-image"
          />
        </div>
        <span className="username">{username}</span>
      </div>
    </header>
  );
};

export default Header;