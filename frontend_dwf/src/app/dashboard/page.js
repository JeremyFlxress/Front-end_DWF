'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import ActivityTable from '../components/ActivityTable';
import Pagination from '../components/Pagination';
import apiService from '@/config/apiService';
import '../styles/pagination.css';

export default function Dashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    librosTotal: 0,
    prestamosActivos: 0,
    prestamosAtrasados: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        setIsLoading(true);

        // Obtener datos del dashboard
        const [booksData, loansData] = await Promise.all([
          apiService.books.getAll(),
          apiService.loans.getAll()
        ]);

        // Calcular préstamos atrasados
        const today = new Date();
        const activeLoans = loansData.filter(loan => !loan.returnedDate);
        const lateLoans = activeLoans.filter(loan => new Date(loan.dueDate) < today);

        // Actualizar datos del dashboard
        setDashboardData({
          librosTotal: booksData.length,
          prestamosActivos: activeLoans.length,
          prestamosAtrasados: lateLoans.length
        });

        // Formatear datos para la tabla de actividades
        const formattedActivities = loansData
          .slice(0, 10) // Mostrar solo los 10 más recientes
          .map(loan => ({
            id: loan.id,
            estudiante: loan.studentName,
            libro: loan.bookTitle,
            fechaPrestamo: new Date(loan.loanDate).toLocaleDateString(),
            estado: loan.returnedDate ? 'Devuelto' : 
                   new Date(loan.dueDate) < today ? 'Atrasado' : 'Activo'
          }));

        setRecentActivities(formattedActivities);
        setTotalItems(formattedActivities.length);

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Calcular índices para paginación
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivities = recentActivities.slice(startIndex, endIndex);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="dashboard-content">
          <h2 className="section-title">Panel Principal</h2>
          
          {isLoading ? (
            <div>Cargando...</div>
          ) : (
            <>
              <div className="cards-container">
                <DashboardCard title="Libros Totales" value={dashboardData.librosTotal} />
                <DashboardCard title="Préstamos Activos" value={dashboardData.prestamosActivos} />
                <DashboardCard title="Préstamos Atrasados" value={dashboardData.prestamosAtrasados} />
              </div>
              
              <div className="activity-section">
                <h2 className="section-title">Actividad reciente</h2>
                <ActivityTable activities={paginatedActivities} />
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={totalItems}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}