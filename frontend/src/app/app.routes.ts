import { Routes } from '@angular/router';
import { WelcomeComponent } from './features/welcome/welcome/welcome.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/homes/dashboard/dashboard.component';
import { CreateHomeComponent } from './features/homes/create-home/create-home.component';
import { JoinHomeComponent } from './features/homes/join-home/join-home.component';
import { HomeDetailsComponent } from './features/home/home-details/home-details.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'homes/create', component: CreateHomeComponent, canActivate: [authGuard] },
  { path: 'homes/join', component: JoinHomeComponent, canActivate: [authGuard] },
  { path: 'home/:id', component: HomeDetailsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
