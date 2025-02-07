import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public host = environment.apiUrl;
  private token: string |undefined;
  private loggedInUsername: string = '';
  private jwtHelper = new JwtHelperService();

  constructor(private http:HttpClient) { }

  public login(user: User): Observable<HttpResponse<User>>{         //observable - go execute this and let me know once it is finished

    return this.http.post<User>(`${this.host}/user/login` , user , {observe: 'response'}); // ne returneaza intreg raspunsul, inclusiv header-ul unde ai tokenul
  } 

  public register (user: User): Observable<User > {
    return this.http.post<User> (`${this.host}/user/register` , user);
  }

  public logOut(): void{
    this.token = '';
    this.loggedInUsername = '';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }

  public saveToken(token: string): void{
    this.token = token;
    localStorage.setItem('token' , token);
  }

  public addUserToLocalCache(user: User): void{
    localStorage.setItem('user' , JSON.stringify(user));
  }

  public getUserFromLocalCache(): User{
    return JSON.parse(localStorage.getItem('user') || '');
  }

  public loadToken(): void{
    this.token = localStorage.getItem('token') || '';
  }

  public getToken(): string{
    return this.token || '';
  }

  public isUserLoggedIn(): boolean{
    this.loadToken();
    if (this.token != null && this.token !== ''){
      if (this.jwtHelper.decodeToken(this.token).sub != null || '') {// din token luam subject-ul (adica username-ul), iar daca nu e empty sau null move forward
        if (!this.jwtHelper.isTokenExpired(this.token)){
          this.loggedInUsername = this.jwtHelper.decodeToken(this.token).sub;
          return true;
        }
      }
    }else {
      this.logOut();
      return false;
    }
    return false;
  }
}
