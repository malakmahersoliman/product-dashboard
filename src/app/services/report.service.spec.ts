import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ReportService } from './report.service';
import { SalesReport } from '../models/report.model';
import { environment } from '../../environments/environment';

const mockReport: SalesReport = {
  from: '2026-06-01',
  to: '2026-06-22',
  totalOrders: 2,
  totalRevenue: 3000,
  averageOrderValue: 1500,
  orders: [
    {
      orderId: 1,
      orderDate: '2026-06-10',
      customerName: 'Test Customer',
      totalAmount: 1500,
    },
  ],
};

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSalesReport should request JSON sales report with date params', () => {
    service.getSalesReport('2026-06-01', '2026-06-22').subscribe((report) => {
      expect(report).toEqual(mockReport);
    });

    const req = httpMock.expectOne(
      (request) => request.url === `${environment.apiUrl}/reports/sales`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('from')).toBe('2026-06-01');
    expect(req.request.params.get('to')).toBe('2026-06-22');
    req.flush(mockReport);
  });

  it('downloadSalesReportPdf should request blob from pdf endpoint', () => {
    const pdfBlob = new Blob(['%PDF-test'], { type: 'application/pdf' });

    service.downloadSalesReportPdf('2026-06-01', '2026-06-22').subscribe((blob) => {
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });

    const req = httpMock.expectOne(
      (request) => request.url === `${environment.apiUrl}/reports/sales/pdf`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    expect(req.request.params.get('from')).toBe('2026-06-01');
    expect(req.request.params.get('to')).toBe('2026-06-22');
    req.flush(pdfBlob);
  });
});
