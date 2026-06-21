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
    component.pageSize = 10;
    component.currentItemsCount = 10;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate visible range labels', () => {
    expect(component.rangeStart).toBe(1);
    expect(component.rangeEnd).toBe(10);

    component.pageNumber = 3;
    expect(component.rangeStart).toBe(21);
    expect(component.rangeEnd).toBe(30);
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

  it('should emit pageSizeChange and reset is handled by parent', () => {
    const spy = vi.spyOn(component.pageSizeChange, 'emit');
    component.onPageSizeChange(20);
    expect(spy).toHaveBeenCalledWith(20);
  });

  it('should build visible page numbers with ellipsis for large page counts', () => {
    component.pageNumber = 10;
    component.totalPages = 20;
    expect(component.visiblePages).toContain('ellipsis');
    expect(component.visiblePages).toContain(1);
    expect(component.visiblePages).toContain(20);
    expect(component.visiblePages).toContain(10);
  });

  it('should show go to page controls for large datasets', () => {
    component.totalPages = 8;
    expect(component.showGoToPage).toBe(true);

    component.totalPages = 5;
    expect(component.showGoToPage).toBe(false);
  });

  it('should emit pageChange from go to page input', () => {
    const spy = vi.spyOn(component.pageChange, 'emit');
    component.totalPages = 12;
    component.goToPageInput = '9';
    component.onGoToPageSubmit();
    expect(spy).toHaveBeenCalledWith(9);
    expect(component.goToPageInput).toBe('');
  });
});
