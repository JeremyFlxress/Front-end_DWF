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
  const [currentPage, setCurrentPage] = useState(0);
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

        // Obtener total de libros
        const booksResponse = await apiService.books.getAll();
        const booksData = booksResponse._embedded?.books || [];

        // Obtener todos los préstamos sin paginación para estadísticas
        const allLoansResponse = await apiService.loans.getAll();
        const allLoansData = allLoansResponse._embedded?.bookLoans || [];
        
        // Calcular estadísticas
        const activeLoans = allLoansData.filter(loan => loan.state === 'PRESTADO');
        const overdueLoans = allLoansData.filter(loan => loan.state === 'VENCIDO');

        setDashboardData({
          librosTotal: booksData.length,
          prestamosActivos: activeLoans.length,
          prestamosAtrasados: overdueLoans.length
        });

        // Obtener préstamos recientes paginados y ordenados por fecha
        const paginatedLoansResponse = await apiService.loans.getAll({
          page: currentPage,
          size: pageSize,
          sort: 'startDate,desc'
        });
        const paginatedLoansData = paginatedLoansResponse._embedded?.bookLoans || [];

        // Formatear actividades usando los campos exactos del backend
        console.log('Loan data:', paginatedLoansData[0]); // Ver estructura de los datos
        const formattedActivities = paginatedLoansData.map(loan => ({
          id: loan.id,
          libro: loan.book.title,
          estudiante: loan.student.fullName,
          fechaPrestamo: loan.startDate,
          fechaDevolucion: loan.returnDate
        }));

        setRecentActivities(formattedActivities);
        setTotalItems(paginatedLoansResponse.page.totalElements || 0);

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
  }, [router, currentPage, pageSize]);

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
                <ActivityTable activities={recentActivities} />
              </div>
              
              <Pagination
                currentPage={currentPage + 1} // Convert to 1-based for display
                totalPages={Math.ceil(totalItems / pageSize)}
                onPageChange={(page) => setCurrentPage(page - 1)} // Convert back to 0-based
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