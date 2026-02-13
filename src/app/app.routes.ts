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
import { UserNewForm } from './features/pages/users/user-new-form/user-new-form';

export const routes: Routes = [
    // Rutas de home
    // No olvidar que las rutas deben estar ordenadas de la mas general a la mas especifica
    { path: 'home', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: '404', component: PageNotFound },
    // Rutas de dashboard usuarios
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'dashboard/users', component: UsersList, canActivate: [authGuard] },
    { path: 'dashboard/users/new', component: UserNewForm, canActivate: [authGuard] },
    { path: 'dashboard/administrative-user/new', component: AdministrativeUserNewForm, canActivate: [authGuard] },
    { path: 'dashboard/client-manager-user/new', component: ClientManagerUserNewForm, canActivate: [authGuard] },
    { path: 'dashboard/administrative-user/edit/:id', component: AdministrativeUserEditForm, canActivate: [authGuard] },
    // Las redirecciones deben ir al final
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: '404', pathMatch: 'full' }
];