import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { User } from '../model/user';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy{

  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];


  constructor(private router: Router, private authenticationService: AuthenticationService){}

  ngOnInit(): void {
    if(this.authenticationService.isUserLoggedIn()){
      this.router.navigateByUrl('/user/manageent');
    }
  }

  public onRegister(user: User):void{
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.register(user).subscribe(
        (response: User) => {
          this.showLoading = false;
          console.log( `A new account was created for ${response.firstName}`);
        },
        (errorRespone: HttpErrorResponse) =>{
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
