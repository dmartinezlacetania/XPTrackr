import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  
}