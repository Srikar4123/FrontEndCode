import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-initial',
  imports: [FormsModule],
  templateUrl: './initial.html',
  styleUrls: ['./initial.css'],
  standalone: true
  
})
export class Initial { 
  constructor(private router: Router) {}

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }

  goToUserLogin() {
    this.router.navigate(['/user-login']);
  }
}