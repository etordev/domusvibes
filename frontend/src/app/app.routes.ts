import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateHomeComponent } from './pages/create-home/create-home.component';
import { JoinHomeComponent } from './pages/join-home/join-home.component';
import { HomeDetailsComponent } from './pages/home-details/home-details.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'homes/create', component: CreateHomeComponent },
  { path: 'homes/join', component: JoinHomeComponent },
  { path: 'home/:id', component: HomeDetailsComponent },
  { path: '**', redirectTo: '' }
];
