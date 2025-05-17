import { Routes } from '@angular/router';
import { RegisterComponent } from './shared/components/register/register.component';
import { LoginComponent } from './shared/components/login/login.component';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { ProfileViewComponent } from './shared/components/profile-view/profile-view.component';
import { ProfileEditComponent } from './shared/components/profile-edit/profile-edit.component';
import { GameDetailComponent } from './shared/components/game-detail/game-detail.component';
import { FriendsComponent } from './shared/components/friends/friends.component';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
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
        // canActivate: [authGuard]
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
        path: 'profile/:userId', // Esta ruta coincide con profile/2
        component: ProfileViewComponent // No tiene canActivate: [authGuard] explícitamente aquí
    },
    {
        path: 'games/:id',
        component: GameDetailComponent,
    },
    {
        path: 'friends',
        component: FriendsComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    }
];


