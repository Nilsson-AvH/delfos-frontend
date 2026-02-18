import { Routes } from '@angular/router';
import { Login } from './features/pages/login/login';
import { Register } from './features/pages/register/register';
import { PageNotFound } from './features/pages/page-not-found/page-not-found';
import { Home } from './features/pages/home/home';
import { UsersList } from './features/pages/users/users-list/users-list';
import { AdministrativeUserNewForm } from './features/pages/users/administrative-user-new-form/administrative-user-new-form';
import { ClientManagerUserNewForm } from './features/pages/users/client-manager-user-new-form/client-manager-user-new-form';
import { Dashboard } from './features/pages/dashboard/dashboard';
import { AdministrativeUserEditForm } from './features/pages/users/administrative-user-edit-form/administrative-user-edit-form';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
// Rutas de usuarios
import { UserNewForm } from './features/pages/users/user-new-form/user-new-form';
import { UserEditForm } from './features/pages/users/user-edit-form/user-edit-form';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

    // Rutas de home

    // No olvidar que las rutas deben estar ordenadas de la mas general a la mas especifica
    { path: 'home', component: Home },
    { path: 'login', component: Login, canActivate: [publicGuard] },
    { path: 'register', component: Register, canActivate: [publicGuard] },
    { path: '404', component: PageNotFound },

    // Rutas de dashboard usuarios

    // NOTA: /dashboard es la ruta donde llega un usuario autenticado
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

    // NOTA: /dashboard/lo-que-sea son las rutas de usuarios autenticados con un rol especifico
    { path: 'dashboard/users', component: UsersList, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin', 'auditor'] } },
    { path: 'dashboard/users/new', component: UserNewForm, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
    { path: 'dashboard/users/edit/:id', component: UserEditForm, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin', 'auditor'] } },
    { path: 'dashboard/client-manager-user/new', component: ClientManagerUserNewForm, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
    // { path: 'dashboard/administrative-user/new', component: AdministrativeUserNewForm, canActivate: [authGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
    // { path: 'dashboard/administrative-user/edit/:id', component: AdministrativeUserEditForm, canActivate: [authGuard], data: { roles: ['root', 'superadmin', 'admin'] } },

    // Las redirecciones deben ir al final
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: '404', pathMatch: 'full' }
];