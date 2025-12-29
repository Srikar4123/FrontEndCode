import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.css'],
  standalone: true
})
export class UserLogin implements OnInit, OnDestroy {
  // Simple toggle between login and register
  isExistingUser = true;
  
  // Login form fields
  email = '';
  password = '';
  
  // Registration form fields
  newName = '';
  newEmail = '';
  newPassword = '';
  confirmPassword = '';
  contactNumber = '';
  
  // Messages
  errorMessage = '';
  successMessage = '';
  
  // Show/hide password - simple feature
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Image slideshow properties
  currentImageIndex = 0;
  slideInterval: any;
  
  // Library images for slideshow
  images = [
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      alt: 'Modern Library Interior',
      title: 'Welcome to Our Library',
      description: 'Discover thousands of books and resources'
    },
    {
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      alt: 'Library Books',
      title: 'Vast Collection',
      description: 'From classics to modern literature'
    },
    {
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop',
      alt: 'Reading Space',
      title: 'Peaceful Reading',
      description: 'Quiet spaces for focused study'
    },
    {
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop',
      alt: 'Digital Library',
      title: 'Digital Resources',
      description: 'Access books anytime, anywhere'
    }
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Start the slideshow with 2-second intervals
    this.startSlideshow();
  }

  ngOnDestroy() {
    // Clean up the interval when component is destroyed
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startSlideshow() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 2000); // 2 seconds as requested
  }

  nextSlide() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentImageIndex = index;
    // Restart the slideshow timer when user manually clicks
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.startSlideshow();
    }
  }

  toggleMode() {
    this.isExistingUser = !this.isExistingUser;
    this.clearMessages();
    this.clearFields();
  }

  // Simple function to format phone number with +91
  formatPhoneNumber() {
    // Remove any non-digit characters
    let digits = this.contactNumber.replace(/\D/g, '');
    
    // If it starts with 91, remove it (we'll add +91 prefix)
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.substring(2);
    }
    
    // Keep only first 10 digits
    if (digits.length > 10) {
      digits = digits.substring(0, 10);
    }
    
    // Update the contact number
    this.contactNumber = digits;
  }
  
  // Simple password validation function
  validatePassword(password: string): string {
    // Check length
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    // Check for capital letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least 1 capital letter';
    }
    
    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least 1 special character';
    }
    
    return ''; // No error
  }

  // Simple function to toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }
  
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  login() {
    // Clear previous messages
    this.errorMessage = '';
    
    // Basic validation - like a beginner would write
    if (!this.email) {
      this.errorMessage = 'Please enter your email';
      return;
    }
    
    if (!this.password) {
      this.errorMessage = 'Please enter your password';
      return;
    }
    
    // Simple email validation
    if (!this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email';
      return;
    }
    
    console.log('User Login:', this.email, this.password);
    this.successMessage = 'Login successful! Redirecting...';
    
    // Simple delay before redirect
    setTimeout(() => {
      this.router.navigate(['/user-portal']);
    }, 1000);
  }

  register() {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';
    
    // Basic validation - step by step like a beginner
    if (!this.newName) {
      this.errorMessage = 'Please enter your name';
      return;
    }
    
    if (!this.newEmail) {
      this.errorMessage = 'Please enter your email';
      return;
    }
    
    if (!this.contactNumber) {
      this.errorMessage = 'Please enter your contact number';
      return;
    }
    
    // Phone number validation - 10 digits only
    let phoneDigits = this.contactNumber.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      this.errorMessage = 'Contact number must be exactly 10 digits';
      return;
    }
    
    if (!this.newPassword) {
      this.errorMessage = 'Please enter a password';
      return;
    }
    
    if (!this.confirmPassword) {
      this.errorMessage = 'Please confirm your password';
      return;
    }
    
    // Simple email check
    if (!this.newEmail.includes('@')) {
      this.errorMessage = 'Please enter a valid email';
      return;
    }
    
    // Password match check
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    // Enhanced password validation
    const passwordError = this.validatePassword(this.newPassword);
    if (passwordError) {
      this.errorMessage = passwordError;
      return;
    }
    
    console.log('New User Registration:', {
      name: this.newName,
      email: this.newEmail,
      password: this.newPassword,
      contactNumber: '+91' + this.contactNumber // Add +91 prefix when saving
    });
    
    this.successMessage = 'Account created successfully! Redirecting to sign in...';
    
    // Auto switch to sign in after 2 seconds
    setTimeout(() => {
      console.log('Before switch - isExistingUser:', this.isExistingUser);
      this.successMessage = '';
      this.isExistingUser = true;
      this.clearFields();
      console.log('After switch - isExistingUser:', this.isExistingUser);
      
      // Force Angular to detect changes
      this.cdr.detectChanges();
    }, 2000);
  }

  goBack() {
    this.router.navigate(['/']);
  }

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
    // Reset password visibility
    this.showPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }
}