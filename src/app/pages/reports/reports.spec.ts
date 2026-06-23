import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Reports } from './reports';
import { ReportService } from '../../services/report.service';
import { SalesReport } from '../../models/report.model';

const mockReport: SalesReport = {
  from: '2026-06-01',
  to: '2026-06-22',
  totalOrders: 1,
  totalRevenue: 1500,
  averageOrderValue: 1500,
  orders: [
    {
      orderId: 42,
      orderDate: '2026-06-10',
      customerName: 'Test Customer',
      totalAmount: 1500,
    },
  ],
};

describe('Reports', () => {
  let reportService: {
    getSalesReport: ReturnType<typeof vi.fn>;
    downloadSalesReportPdf: ReturnType<typeof vi.fn>;
  };
  let fixture: ComponentFixture<Reports>;
  let component: Reports;

  beforeEach(async () => {
    reportService = {
      getSalesReport: vi.fn().mockReturnValue(of(mockReport)),
      downloadSalesReportPdf: vi.fn().mockReturnValue(
        of(new Blob(['%PDF-test'], { type: 'application/pdf' })),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Reports],
      providers: [{ provide: ReportService, useValue: reportService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Reports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate report and display data', () => {
    component.generateReport();
    fixture.detectChanges();

    expect(reportService.getSalesReport).toHaveBeenCalledWith(component.fromDate, component.toDate);
    expect(component.report).toEqual(mockReport);
    expect(component.errorMessage).toBeNull();
    expect(component.isLoading).toBe(false);
  });

  it('should show error when report generation fails', () => {
    reportService.getSalesReport.mockReturnValue(throwError(() => new Error('API error')));

    component.generateReport();
    fixture.detectChanges();

    expect(component.report).toBeNull();
    expect(component.errorMessage).toBe('Unable to generate the sales report. Please try again.');
  });

  it('should validate date range before generating report', () => {
    component.fromDate = '2026-06-30';
    component.toDate = '2026-06-01';

    component.generateReport();

    expect(reportService.getSalesReport).not.toHaveBeenCalled();
    expect(component.validationMessage).toBe('Start date must be on or before end date.');
  });

  it('should download pdf and trigger browser download', () => {
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    component.downloadPdf();
    fixture.detectChanges();

    expect(reportService.downloadSalesReportPdf).toHaveBeenCalledWith(
      component.fromDate,
      component.toDate,
    );
    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:test-url');
    expect(component.isDownloadingPdf).toBe(false);
    expect(component.errorMessage).toBeNull();

    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it('should show error when pdf download fails', () => {
    reportService.downloadSalesReportPdf.mockReturnValue(
      throwError(() => new Error('PDF error')),
    );

    component.downloadPdf();
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Unable to generate the PDF report. Please try again.');
    expect(component.isDownloadingPdf).toBe(false);
  });
});
