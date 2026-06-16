import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Pagination } from './pagination';

describe('Pagination', () => {
  let component: Pagination;
  let fixture: ComponentFixture<Pagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    component.pageNumber = 1;
    component.totalPages = 5;
    component.totalCount = 50;
    component.currentItemsCount = 10;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit pageChange when navigating to next page', () => {
    const spy = vi.spyOn(component.pageChange, 'emit');
    component.goToNextPage();
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should not emit pageChange when already on first page', () => {
    const spy = vi.spyOn(component.pageChange, 'emit');
    component.goToPreviousPage();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should build visible page numbers with ellipsis for large page counts', () => {
    component.pageNumber = 10;
    component.totalPages = 20;
    expect(component.visiblePages).toContain('ellipsis');
    expect(component.visiblePages).toContain(1);
    expect(component.visiblePages).toContain(20);
    expect(component.visiblePages).toContain(10);
  });
});
