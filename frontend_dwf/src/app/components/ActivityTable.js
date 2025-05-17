// components/ActivityTable.js
import React from 'react';

const ActivityTable = ({ activities }) => {
  return (
    <div className="activity-table-container">
      <table className="activity-table">
        <thead>
          <tr>
            <th>ID Prestamo</th>
            <th>Libro</th>
            <th>Estudiante</th>
            <th>Fecha Préstamo</th>
            <th>Fecha Devolución</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr key={index}>
              <td>{activity.id}</td>
              <td>{activity.libro}</td>
              <td>{activity.estudiante}</td>
              <td>{activity.fechaPrestamo}</td>
              <td>{activity.fechaDevolucion}</td>
              <td>
                <span className={`status-badge ${activity.estado.toLowerCase()}`}>
                  {activity.estado}
                </span>
              </td>
              <td>
                <button className="action-button">Acciones</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;