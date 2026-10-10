import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateHomeComponent } from './pages/create-home/create-home.component';
import { JoinHomeComponent } from './pages/join-home/join-home.component';
import { HomeDetailsComponent } from './pages/home-details/home-details.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'homes/create', component: CreateHomeComponent, canActivate: [authGuard] },
  { path: 'homes/join', component: JoinHomeComponent, canActivate: [authGuard] },
  { path: 'home/:id', component: HomeDetailsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
