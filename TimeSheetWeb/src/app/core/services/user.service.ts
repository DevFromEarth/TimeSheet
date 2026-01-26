import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {
  getActiveEmployees(): Observable<User[]> {
    return this.get<User[]>('User/active-employees');
  }
}
