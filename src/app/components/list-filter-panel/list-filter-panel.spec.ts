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
          { label: 'Pending', value: 'Pending', count: 4 },
        ],
      },
    ];
    component.initialValues = { search: '', status: 'All' };
    component.ngOnChanges({
      initialValues: {
        currentValue: component.initialValues,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
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

  it('should emit search when apply button is clicked', () => {
    const spy = vi.spyOn(component.search, 'emit');
    component.setDraftValue('search', 'order-1');
    component.onSearch();
    expect(spy).toHaveBeenCalledWith({
      values: { search: 'order-1', status: 'All' },
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

  it('should keep draft values when initialValues reference changes with same values', () => {
    component.setDraftValue('search', 'pending query');
    component.ngOnChanges({
      initialValues: {
        currentValue: { search: '', status: 'All' },
        previousValue: { search: '', status: 'All' },
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(component.getDraftValue('search')).toBe('pending query');
    expect(component.hasPendingChanges).toBe(true);
  });

  it('should build active chips for applied non-default filters', () => {
    component.setDraftValue('search', 'widget');
    component.setDraftValue('status', 'Pending');
    component.onSearch();

    expect(component.activeChips).toEqual([
      { key: 'search', label: 'Search...', valueLabel: 'widget' },
      { key: 'status', label: 'Status', valueLabel: 'Pending' },
    ]);
  });

  it('should remove a chip and emit search immediately', () => {
    const spy = vi.spyOn(component.search, 'emit');
    component.setDraftValue('search', 'widget');
    component.setDraftValue('status', 'Pending');
    component.onSearch();

    component.onRemoveChip('search');

    expect(component.getDraftValue('search')).toBe('');
    expect(spy).toHaveBeenLastCalledWith({
      values: { search: '', status: 'Pending' },
    });
  });

  it('should format option labels with counts', () => {
    expect(component.formatOptionLabel({ label: 'Pending', count: 4 })).toBe('Pending (4)');
    expect(component.formatOptionLabel({ label: 'All' })).toBe('All');
  });
});
