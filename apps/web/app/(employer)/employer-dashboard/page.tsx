import React, { Suspense } from 'react';
import EmployerDashboardClient from './EmployerDashboardClient';

// Server wrapper — client UI is inside EmployerDashboardClient

export default function EmployerDashboard() {
  return (
    <React.Fragment>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading dashboard...</div>}>
        {/* Client component handles hooks like useSearchParams */}
        <EmployerDashboardClient />
      </Suspense>
    </React.Fragment>
  );
}