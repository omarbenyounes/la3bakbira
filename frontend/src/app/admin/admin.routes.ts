import { Routes } from '@angular/router';
import { AdminLayout } from './admin-layout';
import { AdminDashboard } from './admin-dashboard';

/** Loaded lazily, only after adminGuard has granted access. */
export default [
  {
    path: '',
    component: AdminLayout,
    children: [{ path: '', component: AdminDashboard, title: 'Administration – la3bakbira' }],
  },
] satisfies Routes;
