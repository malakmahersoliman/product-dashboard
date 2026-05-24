import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { StatisticsService } from '../../services/statistics.service';
import { StatisticsResponse } from '../../models/statistics.model';

const mockStatistics: StatisticsResponse = {
  products: { total: 10, available: 8, outOfStock: 1, lowStock: 2 },
  orders: { total: 5, pending: 2, completed: 2, cancelled: 1, todaySales: 150 },
  customers: { total: 3 },
  users: { total: 2, superAdmins: 1, regularUsers: 1 },
};

describe('Dashboard', () => {
  let statisticsService: { getStatistics: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    statisticsService = {
      getStatistics: vi.fn().mockReturnValue(of(mockStatistics)),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: StatisticsService, useValue: statisticsService }],
    }).compileComponents();
  });

  it('should create and load statistics', () => {
    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(statisticsService.getStatistics).toHaveBeenCalled();
    expect(component.statistics).toEqual(mockStatistics);
    expect(component.errorMessage).toBeNull();
  });

  it('should show error when statistics load fails', () => {
    statisticsService.getStatistics.mockReturnValue(
      throwError(() => new Error('API error')),
    );

    const fixture = TestBed.createComponent(Dashboard);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.statistics).toBeNull();
    expect(component.errorMessage).toBe('Unable to load statistics. Please try again.');
  });
});
