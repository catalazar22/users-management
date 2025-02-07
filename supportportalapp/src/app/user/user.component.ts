import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { AuthenticationService } from '../service/authentication.service';
import { formatNumber } from '@angular/common';
import { NgForm } from '@angular/forms';
import { CustomHttpResponse } from '../model/custom-http-respone';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FileUploadStatus } from '../model/file-upload.status';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable(); // de fiecare data cand asta de mai sus se modifica din user, aici se actualizeaza valoarea
  public users: User[] = [];
  public refreshing: boolean = false;
  public selectedUser: User = new User();
  public fileName?: string = '';
  public profileImage?: File | null = null;
  private subscriptions: Subscription[] = [];
  protected loggedUsername: string = 'user';
  public response: User = new User();
  public user: User = new User();
  public editUser = new User();
  private currentUsername: string = '';
  public fileStatus = new FileUploadStatus();


  constructor(private userService: UserService,
    private authenticationService: AuthenticationService,
    private toastr: ToastrService,
    private router: Router) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.getUsers(true);

  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalCache(response);
          this.users = response;
          this.refreshing = false;
          if (showNotification) {
            console.log(`${response.length} user(s) loaded suuccessfully`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse.error.message)
        }
      )
    )
  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton('openUserInfo');
  }

  public onProfileImageChange(eventTarget: any): void {
    const inputEventTarget = eventTarget as HTMLInputElement;

    let file = inputEventTarget.files?.item(0);
    this.fileName = file?.name;
    this.profileImage = file;

  }

  public saveNewUser(): void {
    this.clickButton('new-user-save');
  }

  public onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUserFormData('', userForm.value, this.profileImage);
    this.subscriptions.push(
      this.userService.addUser(formData).subscribe(
        (response: User) => {
          this.clickButton('new-user-close');
          this.getUsers(false);
          this.fileName = '';
          this.profileImage = null;
          userForm.reset();
          console.log(`${response.firstName} ${response.lastName} updated suuccessfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse.error.message)
          this.profileImage = null;
        }
      )
    );
  }

  public onUpdateUser(): void {
    const formData = this.userService.createUserFormData(this.currentUsername, this.editUser, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.clickButton('closeEditUserModalButton');
          this.getUsers(false);
          this.fileName = '';
          this.profileImage = null;
          console.log(`${response.firstName} ${response.lastName} updated successfully`)
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse.error.message)
          this.profileImage = null;
        }
      )
    )
  }

  public searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userId.indexOf(searchTerm) !== -1) {
        results.push(user);
      }
    }
    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    this.currentUsername = this.authenticationService.getUserFromLocalCache().username;
    const formData = this.userService.createUserFormData(this.currentUsername, user, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.authenticationService.addUserToLocalCache(response);
          this.getUsers(false);
          this.fileName = '';
          this.profileImage = null;
          console.log(`${response.firstName} ${response.lastName} updated successfully`)
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse.error.message)
          this.profileImage = null;
          this.refreshing = false;
        }
      )
    );
  }

  public onUpdateProfileImage(): void {
    if (this.profileImage) {
      const formData = new FormData();
      formData.append('username', this.user.username);
      formData.append('profileImage', this.profileImage);
      this.subscriptions.push(
        this.userService.updateProfileImage(formData).subscribe(
          (event: HttpEvent<any>) => {
            this.reportUploadProgress(event);
          },
          (errorResponse: HttpErrorResponse) => {
            console.log(errorResponse.error.message)
            this.fileStatus.status = 'done';
          }
        )
      );
    }
  }

  private reportUploadProgress(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage = Math.round(100 * ((event.loaded || 1) / (event.total || 1)));
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response:
        if (event.status === 200) {
          this.user.profileImageUrl = `${event.body.profileImageUrl}?time = ${new Date().getTime}`;
          console.log(`Profile Image Updated Successfully!`);
          this.fileStatus.status = 'done';
          break;
        } else {
          console.log(`Unable to upload image. Please try again.`)
          break;
        }
      default:
        `Finishel all processes`;
    }
  }

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    console.log(`You've been successfully logged out`);
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email'];
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpResponse) => {
          console.log(response.message);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse.error.message)
          this.refreshing = false;
        },
        () => emailForm.reset()
      )
    )
  }

  public onDeleteUser(username: string): void {
    this.subscriptions.push(
      this.userService.deteleUser(username).subscribe(
        (response: CustomHttpResponse) => {
          console.log(response.message);
          this.getUsers(false);
          this.toastr.success("User Deleted Successfully");
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse.error.message)
          this.toastr.error("User could not be deleted");
        }
      )
    )
  }

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId)!.click();
  }

}
