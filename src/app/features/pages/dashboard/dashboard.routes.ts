import { Routes } from '@angular/router';
import { roleGuard } from '../../../core/guards/role-guard';

export const dashboardRoutes: Routes = [
    {
        path: 'users',
        children: [
            {
                path: '',
                loadComponent: () => import('../users/users-list/users-list'),
                data: { roles: ['root', 'superadmin', 'admin', 'auditor'] }
            },
            {
                path: 'new',
                loadComponent: () => import('../users/user-new-form/user-new-form'),
                data: { roles: ['root', 'superadmin', 'admin'] }
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('../users/user-edit-form/user-edit-form'),
                data: { roles: ['root', 'superadmin', 'admin'] }
            }
        ],
        canActivate: [roleGuard],
        // data: { roles: ['root', 'superadmin', 'admin'] }
    },


    {
        path: 'clients',
        children: [
            {
                path: '',
                loadComponent: () => import('../clients/client-list/client-list'),
                data: { roles: ['root', 'superadmin', 'admin', 'auditor'] }
            },
            {
                path: 'new',
                loadComponent: () => import('../clients/client-new-form/client-new-form'),
                data: { roles: ['root', 'superadmin', 'admin'] }
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('../clients/client-edit-form/client-edit-form'),
                data: { roles: ['root', 'superadmin', 'admin'] }
            }
        ],
        canActivate: [roleGuard],
        // data: { roles: ['root', 'superadmin', 'admin'] }
    }
];




//Todas las rutas hijas que inician con /dashboard
// Rutas que implementan la carga perezosa Lazy Loading; Requieren que la clase del componente se exporte con (export default class NombreClase)
// { path: 'users', loadComponent: () => import('./features/pages/users/users-list/users-list').then(m => m.UsersList), canActivateChild: [roleGuard], data: { roles: ['root', 'superadmin', 'admin', 'auditor'] } },
// { path: 'users/new', loadComponent: () => import('./features/pages/users/user-new-form/user-new-form').then(m => m.UserNewForm), canActivateChild: [roleGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
// { path: 'users/edit/:id', loadComponent: () => import('./features/pages/users/user-edit-form/user-edit-form').then(m => m.UserEditForm), canActivateChild: [roleGuard], data: { roles: ['root', 'superadmin', 'admin', 'auditor'] } },
// { path: 'client-manager-user/new', loadComponent: () => import('./features/pages/users/client-manager-user-new-form/client-manager-user-new-form').then(m => m.ClientManagerUserNewForm), canActivateChild: [roleGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
//{ path: 'client-manager-user/edit/:id', loadComponent: () => import('./features/pages/users/client-manager-user-edit-form/client-manager-user-edit-form').then(m => m.ClientManagerUserEditForm), canActivateChild: [roleGuard], data: { roles: ['root', 'superadmin', 'admin'] } },