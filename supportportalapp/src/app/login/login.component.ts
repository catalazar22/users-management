import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { User } from '../model/user';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy{
  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];


  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    if(this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    }else {
      this.router.navigateByUrl('/login');
    }
  }

  public onLogin(user: User): void {
      this.showLoading = true;
      this.subscriptions.push(
        this.authenticationService.login(user).subscribe(
          (response: HttpResponse<User>) => {
            const token = response.headers.get('Jwt-Token');
            this.authenticationService.saveToken(token || '');
            this.authenticationService.addUserToLocalCache(response.body || new User);
            this.router.navigateByUrl('/user/management');
            this.showLoading = false; 
          },
          (errorRespone: HttpErrorResponse) => {
            console.log(errorRespone.error.message);
            this.showLoading = false;
          }
        )
      );

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
  }

}
