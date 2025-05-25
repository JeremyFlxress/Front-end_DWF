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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;