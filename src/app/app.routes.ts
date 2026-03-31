import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { redirectGuard } from './guards/redirect.guard';
import { EmptyComponent } from './components/empty/empty.component';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent), canActivate: [authGuard] },
  { path: '', canActivate: [redirectGuard], component: EmptyComponent },
  { path: '**', redirectTo: 'home' },
];
