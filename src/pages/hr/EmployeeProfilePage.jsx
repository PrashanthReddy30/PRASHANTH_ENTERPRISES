import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Employee360Profile } from './Employee360Profile';

/**
 * Dedicated Employee 360° Profile Page
 * Route: /hr/employees/:employeeId/profile
 * Loads the exact selected employee's records from Firebase / Central Store.
 */
export function EmployeeProfilePage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <Employee360Profile 
        employeeId={employeeId} 
        onBack={() => navigate('/hr/employees')} 
      />
    </div>
  );
}

export default EmployeeProfilePage;
