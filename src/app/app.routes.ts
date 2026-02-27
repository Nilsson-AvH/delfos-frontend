import { Routes } from '@angular/router';

// // import { Login } from './features/pages/login/login';
// import { Register } from './features/pages/register/register';
// import { Login } from './features/pages/login/login';
// import { UsersList } from './features/pages/users/users-list/users-list';
// import { AdministrativeUserNewForm } from './features/pages/users/administrative-user-new-form/administrative-user-new-form';
// import { ClientManagerUserNewForm } from './features/pages/users/client-manager-user-new-form/client-manager-user-new-form';
// import { Dashboard } from './features/pages/dashboard/dashboard';
// import { AdministrativeUserEditForm } from './features/pages/users/administrative-user-edit-form/administrative-user-edit-form';
// // Rutas de usuarios
// import { UserNewForm } from './features/pages/users/user-new-form/user-new-form';
// import { UserEditForm } from './features/pages/users/user-edit-form/user-edit-form';

import { Home } from './features/pages/home/home';
import { PageNotFound } from './features/pages/page-not-found/page-not-found';

import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

    // Rutas de home

    // No olvidar que las rutas deben estar ordenadas de la mas general a la mas especifica

    {
        path: '',
        children: [
            // Rutas que cargan de forma estatica
            { path: 'home', component: Home },
            { path: '404', component: PageNotFound },
            {
                path: '',
                canActivate: [publicGuard],
                children: [
                    // Rutas que cargan de forma perezosa Lazy Loading (loadComponent)
                    { path: 'login', loadComponent: () => import('./features/pages/login/login').then(m => m.Login) },
                    { path: 'register', loadComponent: () => import('./features/pages/register/register').then(m => m.Register) },
                ]
            }
        ]
    },

    // Lazy loading de componentes carga perezosa del componente (loadComponent) el .then resuelve la promesa del componente
    // { path: 'home', component: Home /* loadChildren: () => import('./features/pages/home/home').then(m => m.Home)*/ },
    // Lazy loading de componentes carga perezosa del componente (loadComponent) el .se agrega default para que pueda ser importado y no se requiera el .then
    // { path: '404', /*component: PageNotFound*/ loadChildren: () => import('./features/pages/page-not-found/page-not-found').then(m => m.PageNotFound) },

    // { path: 'login', component: Login /*loadChildren: () => import('./features/pages/login/login')*/, canActivate: [publicGuard] },
    // { path: 'register', /*component: Register*/ loadChildren: () => import('./features/pages/register/register').then(m => m.Register), canActivate: [publicGuard] },
    // Rutas de dashboard usuarios

    // NOTA: /dashboard es la ruta donde llega un usuario autenticado
    // { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },


    // Agrupa todas las rutas permissionadas
    {
        // NOTA: /dashboard es la ruta donde llega un usuario autenticado
        path: 'dashboard',
        loadComponent: () => import('./features/pages/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [authGuard],
        //OBLIGATORIO: Toda ruta hija requiere que su componente padre tenga un router-outlet donde se renderizara el contenido de la ruta hija
        loadChildren: () => import('./features/pages/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
    },

    // NOTA: /dashboard/lo-que-sea son las rutas de usuarios autenticados con un rol especifico
    // { path: 'dashboard/users', component: UsersList, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin', 'auditor'] } },
    // { path: 'dashboard/users/new', component: UserNewForm, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
    // { path: 'dashboard/users/edit/:id', component: UserEditForm, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin', 'auditor'] } },
    // { path: 'dashboard/client-manager-user/new', component: ClientManagerUserNewForm, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
    // { path: 'dashboard/client-manager-user/edit/:id', component: ClientManagerUserEditForm, canActivate: [authGuard, roleGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
    // { path: 'dashboard/administrative-user/new', component: AdministrativeUserNewForm, canActivate: [authGuard], data: { roles: ['root', 'superadmin', 'admin'] } },
    // { path: 'dashboard/administrative-user/edit/:id', component: AdministrativeUserEditForm, canActivate: [authGuard], data: { roles: ['root', 'superadmin', 'admin'] } },

    // Las redirecciones deben ir al final
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: '404', pathMatch: 'full' }
];