// components/ActivityTable.js
import React, { useState } from 'react';

const ActivityTable = ({ activities }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'fechaPrestamo',
    direction: 'desc'
  });

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'PRESTADO': return 'estado-prestado';
      case 'VENCIDO': return 'estado-vencido';
      case 'ENTREGADO': return 'estado-entregado';
      default: return '';
    }
  };

  const formatearEstado = (estado) => {
    switch(estado) {
      case 'PRESTADO': return 'Prestado';
      case 'VENCIDO': return 'Vencido';
      case 'ENTREGADO': return 'Entregado';
      default: return estado;
    }
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedActivities = () => {
    const sortedActivities = [...activities];
    sortedActivities.sort((a, b) => {
      if (sortConfig.key === 'fechaPrestamo' || sortConfig.key === 'fechaDevolucion') {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortedActivities;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div className="activity-table-container">
      <table className="activity-table">
        <thead>
          <tr>
            <th onClick={() => sortData('id')}>
              ID Prestamo{getSortIcon('id')}
            </th>
            <th onClick={() => sortData('libro')}>
              Libro{getSortIcon('libro')}
            </th>
            <th onClick={() => sortData('estudiante')}>
              Estudiante{getSortIcon('estudiante')}
            </th>
            <th onClick={() => sortData('fechaPrestamo')}>
              Fecha Préstamo{getSortIcon('fechaPrestamo')}
            </th>
            <th onClick={() => sortData('fechaDevolucion')}>
              Fecha Devolución{getSortIcon('fechaDevolucion')}
            </th>
            <th onClick={() => sortData('estado')}>
              Estado{getSortIcon('estado')}
            </th>
          </tr>
        </thead>
        <tbody>
          {getSortedActivities().map((activity) => (
            <tr key={activity.id}>
              <td>{activity.id}</td>
              <td>{activity.libro}</td>
              <td>{activity.estudiante}</td>
              <td>{activity.fechaPrestamo}</td>
              <td>{activity.fechaDevolucion}</td>
              <td>
                <span className={`status-badge ${getEstadoClass(activity.estado)}`}>
                  {formatearEstado(activity.estado)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;