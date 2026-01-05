import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent {
  ngOnInit() {
    setInterval(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = iframe.src;
      }
    }, 30000);
  }
}
