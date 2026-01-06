import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css'],
})
export class AdminLogin implements OnInit, OnDestroy {
  // Toggle between login and register
  isExistingAdmin = true;

  // Login fields
  email = '';
  password = '';

  // Registration fields
  newName = '';
  newEmail = '';
  newPassword = '';
  confirmPassword = '';
  contactNumber = '';

  // Messages
  errorMessage = '';
  successMessage = '';

  // Password visibility
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Slideshow
  currentImageIndex = 0;
  slideTimeout: any;

  // Slideshow images
  images = [
    {
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      alt: 'Library Books',
      // title: 'Vast Collection',
      // description: 'From classics to modern literature',
    },
    {
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop',
      alt: 'Reading Space',
      // title: 'Peaceful Reading',
      // description: 'Quiet spaces for focused study',
    },
    {
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop',
      alt: 'Digital Library',
      // title: 'Digital Resources',
      // description: 'Access books anytime, anywhere',
    },
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef, private http: HttpClient) {}

  // Lifecycle hooks
  ngOnInit() {
    this.startSlideshow();
  }

  ngOnDestroy() {
    this.stopSlideshow();
  }

  startSlideshow() {
    this.stopSlideshow();

    this.slideTimeout = setTimeout(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;

      this.cdr.detectChanges(); // 🔥 FORCE UI UPDATE
      this.startSlideshow(); // 🔁 recursive
    }, 2000);
  }

  stopSlideshow() {
    if (this.slideTimeout) {
      clearTimeout(this.slideTimeout);
    }
  }

  goToSlide(index: number) {
    this.currentImageIndex = index;
    this.cdr.detectChanges();
    this.startSlideshow();
  }

  // UI helpers
  toggleMode() {
    this.isExistingAdmin = !this.isExistingAdmin;
    this.clearMessages();
    this.clearFields();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Phone formatting
  formatPhoneNumber() {
    let digits = this.contactNumber.replace(/\D/g, '');

    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.substring(2);
    }

    if (digits.length > 10) {
      digits = digits.substring(0, 10);
    }

    this.contactNumber = digits;
  }

  // Password validation
  validatePassword(password: string): string {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least 1 capital letter';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least 1 special character';
    }
    return '';
  }

  login() {
    console.log('LOGIN CALLED'); // 🧪 Debug – you should see this

    this.clearMessages();

    // Frontend validation
    if (!this.email) {
      this.errorMessage = 'Please enter your email';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Please enter your password';
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email';
      return;
    }

    const payload = {
      email: this.email.trim(),
      password: this.password,
    };

    this.http.post<any>('https://localhost:7264/api/accounts/login', payload).subscribe({
      next: (res) => {
        this.successMessage = 'Login successful! Redirecting...';

        localStorage.setItem('account', JSON.stringify(res));

        this.stopSlideshow();

        setTimeout(() => {
          if (res.role === 1) {
            // Admin
            this.router.navigate(['/admin-portal']);
          } else {
            // User
            this.router.navigate(['/user-portal']);
          }
        }, 500);
      },

      error: (err) => {
        console.log('Login error:', err);

        if (err.status === 401 || err.status === 403) {
          this.errorMessage = err.error?.message || 'Invalid credentials';
        } else {
          this.errorMessage = 'Server error. Please try again later.';
        }
      },
    });
  }

  // register() {
  //   this.clearMessages();

  //   if (!this.newName) {
  //     this.errorMessage = 'Please enter your name';
  //     return;
  //   }

  //   if (!this.newEmail) {
  //     this.errorMessage = 'Please enter your email';
  //     return;
  //   }

  //   if (!this.contactNumber) {
  //     this.errorMessage = 'Please enter your contact number';
  //     return;
  //   }

  //   if (this.contactNumber.replace(/\D/g, '').length !== 10) {
  //     this.errorMessage = 'Contact number must be 10 digits';
  //     return;
  //   }

  //   if (!this.newPassword || !this.confirmPassword) {
  //     this.errorMessage = 'Please enter and confirm your password';
  //     return;
  //   }

  //   if (!this.newEmail.includes('@')) {
  //     this.errorMessage = 'Please enter a valid email';
  //     return;
  //   }

  //   if (this.newPassword !== this.confirmPassword) {
  //     this.errorMessage = 'Passwords do not match';
  //     return;
  //   }

  //   const passwordError = this.validatePassword(this.newPassword);
  //   if (passwordError) {
  //     this.errorMessage = passwordError;
  //     return;
  //   }

  //   console.log('Admin Registered:', {
  //     name: this.newName,
  //     email: this.newEmail,
  //     contact: '+91' + this.contactNumber,
  //   });

  //   this.successMessage = 'Admin account created successfully! Redirecting...';

  //   setTimeout(() => {
  //     this.isExistingAdmin = true;
  //     this.clearFields();
  //     this.successMessage = '';
  //   }, 2000);
  // }

  goBack() {
    this.stopSlideshow();
    this.router.navigate(['/']);
  }

  // Cleanup helpers
  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearFields() {
    this.email = '';
    this.password = '';
    this.newName = '';
    this.newEmail = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.contactNumber = '';
    this.showPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }
}
