'use client';
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import ActivityTable from '../components/ActivityTable';

// Datos de muestra - Estos vendrían de tu backend en el futuro
const dashboardData = {
  librosTotal: 100,
  prestamosActivos: 80,
  prestamosAtrasados: 15
};

// Actividades recientes de muestra
const recentActivities = [
  { id: 'P24001', libro: 'Libro 1', estudiante: 'Estudiante 1', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
  { id: 'P24001', libro: 'Libro 2', estudiante: 'Estudiante 2', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
  { id: 'P24001', libro: 'Libro 3', estudiante: 'Estudiante 3', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
  { id: 'P24001', libro: 'Libro 4', estudiante: 'Estudiante 4', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
  { id: 'P24001', libro: 'Libro 5', estudiante: 'Estudiante 5', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
  { id: 'P24001', libro: 'Libro 6', estudiante: 'Estudiante 6', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' }
];

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="dashboard-content">
          <h2 className="section-title">Panel Principal</h2>
          
          <div className="cards-container">
            <DashboardCard title="Libros Totales" value={dashboardData.librosTotal} />
            <DashboardCard title="Préstamos Activos" value={dashboardData.prestamosActivos} />
            <DashboardCard title="Préstamos Atrasados" value={dashboardData.prestamosAtrasados} />
          </div>
          
          <div className="activity-section">
            <h2 className="section-title">Actividad reciente</h2>
            <ActivityTable activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}