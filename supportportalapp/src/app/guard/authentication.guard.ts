import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router){}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean{
      return this.isUserLoggedIn();
  }

  private isUserLoggedIn(): boolean{
      if(this.authenticationService.isUserLoggedIn()){
        return true;
      }
      this.router.navigate(['/login']);
      console.log('You need to log in to access this page')
      //send notification to user
      return false;
  }
  
}
