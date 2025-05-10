import { Routes } from '@angular/router';
import { RegisterComponent } from './shared/components/register/register.component';
import { LoginComponent } from './shared/components/login/login.component';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { ProfileViewComponent } from './shared/components/profile-view/profile-view.component';
import { ProfileEditComponent } from './shared/components/profile-edit/profile-edit.component';

export const routes: Routes = [
    {
        path: 'register',
        component: RegisterComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        component: ProfileViewComponent,
        canActivate: [authGuard]
    },
    {
        path: 'profile/edit',
        component: ProfileEditComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }

];


