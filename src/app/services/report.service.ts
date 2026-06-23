import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SalesReport } from '../models/report.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  getSalesReport(from: string, to: string): Observable<SalesReport> {
    return this.http.get<SalesReport>(`${this.apiUrl}/sales`, {
      params: { from, to },
    });
  }
  downloadSalesReportPdf(from: string, to: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/sales/pdf`, {
      params: { from, to },
      responseType: 'blob',
    });
  }
}
