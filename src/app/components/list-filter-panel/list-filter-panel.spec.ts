import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ListFilterPanel } from './list-filter-panel';

describe('ListFilterPanel', () => {
  let component: ListFilterPanel;
  let fixture: ComponentFixture<ListFilterPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFilterPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ListFilterPanel);
    component = fixture.componentInstance;
    component.fields = [
      { key: 'search', type: 'search', placeholder: 'Search...' },
      {
        key: 'status',
        type: 'button-group',
        label: 'Status',
        options: [
          { label: 'All', value: 'All' },
          { label: 'Pending', value: 'Pending' },
        ],
      },
    ];
    component.initialValues = { search: '', status: 'All' };
    component.defaultPageSize = 10;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit search when draft values change', () => {
    const spy = vi.spyOn(component.search, 'emit');
    component.setDraftValue('search', 'test');
    expect(spy).not.toHaveBeenCalled();
    expect(component.hasPendingChanges).toBe(true);
  });

  it('should emit search when search button is clicked', () => {
    const spy = vi.spyOn(component.search, 'emit');
    component.setDraftValue('search', 'order-1');
    component.onSearch();
    expect(spy).toHaveBeenCalledWith({
      values: { search: 'order-1', status: 'All' },
      pageSize: 10,
    });
    expect(component.hasPendingChanges).toBe(false);
  });

  it('should reset draft values and emit on reset', () => {
    const searchSpy = vi.spyOn(component.search, 'emit');
    const resetSpy = vi.spyOn(component.reset, 'emit');

    component.setDraftValue('search', 'changed');
    component.setDraftValue('status', 'Pending');
    component.onReset();

    expect(component.getDraftValue('search')).toBe('');
    expect(component.getDraftValue('status')).toBe('All');
    expect(resetSpy).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalled();
  });
});
