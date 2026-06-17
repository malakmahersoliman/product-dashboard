import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FilterFieldValue,
  FilterValues,
  ListFilterField,
  ListFilterSearchEvent,
} from './list-filter-panel.model';

@Component({
  selector: 'app-list-filter-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './list-filter-panel.html',
  styleUrl: './list-filter-panel.css',
})
export class ListFilterPanel implements OnChanges {
  @Input({ required: true }) fields: ListFilterField[] = [];
  @Input({ required: true }) initialValues!: FilterValues;
  @Input() title = 'Filters';
  @Input() subtitle = 'Adjust filters, then click Search to apply.';
  @Input() searchLabel = 'Search';
  @Input() resetLabel = 'Reset';
  @Input() defaultPageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20];
  @Input() pageSizeLabel = 'Page size';
  @Input() disabled = false;

  @Output() search = new EventEmitter<ListFilterSearchEvent>();
  @Output() reset = new EventEmitter<ListFilterSearchEvent>();

  draftValues: FilterValues = {};
  draftPageSize = 10;

  private appliedValues: FilterValues = {};
  private appliedPageSize = 10;

  ngOnChanges(changes: SimpleChanges): void {
    const initialValuesChange = changes['initialValues'];
    const defaultPageSizeChange = changes['defaultPageSize'];

    const initialValuesChanged =
      !!initialValuesChange &&
      (initialValuesChange.firstChange ||
        !this.areFilterValuesEqual(
          initialValuesChange.currentValue,
          initialValuesChange.previousValue
        ));

    if (initialValuesChanged || defaultPageSizeChange?.firstChange) {
      this.syncDraftFromInitial();
      return;
    }

    if (
      defaultPageSizeChange &&
      defaultPageSizeChange.previousValue !== defaultPageSizeChange.currentValue
    ) {
      this.draftPageSize = this.defaultPageSize;
      this.appliedPageSize = this.defaultPageSize;
    }
  }

  get searchFields(): ListFilterField[] {
    return this.fields.filter((field) => field.type === 'search');
  }

  get selectFields(): ListFilterField[] {
    return this.fields.filter((field) => field.type === 'select');
  }

  get buttonGroupFields(): ListFilterField[] {
    return this.fields.filter((field) => field.type === 'button-group');
  }

  get hasPendingChanges(): boolean {
    if (this.draftPageSize !== this.appliedPageSize) {
      return true;
    }

    return this.fields.some(
      (field) => this.draftValues[field.key] !== this.appliedValues[field.key]
    );
  }

  getDraftValue(key: string): FilterFieldValue {
    return this.draftValues[key] ?? null;
  }

  setDraftValue(key: string, value: FilterFieldValue): void {
    this.draftValues[key] = value;
  }

  isButtonActive(field: ListFilterField, value: FilterFieldValue): boolean {
    return this.getDraftValue(field.key) === value;
  }

  onSearch(): void {
    if (this.disabled) {
      return;
    }

    this.appliedValues = { ...this.draftValues };
    this.appliedPageSize = this.draftPageSize;

    this.search.emit({
      values: this.appliedValues,
      pageSize: this.appliedPageSize,
    });
  }

  onReset(): void {
    if (this.disabled) {
      return;
    }

    this.syncDraftFromInitial();
    this.appliedValues = { ...this.draftValues };
    this.appliedPageSize = this.draftPageSize;

    const event: ListFilterSearchEvent = {
      values: this.appliedValues,
      pageSize: this.appliedPageSize,
    };

    this.reset.emit(event);
    this.search.emit(event);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearch();
    }
  }

  private syncDraftFromInitial(): void {
    this.draftValues = { ...this.initialValues };
    this.draftPageSize = this.defaultPageSize;
    this.appliedValues = { ...this.draftValues };
    this.appliedPageSize = this.draftPageSize;
  }

  private areFilterValuesEqual(
    current: FilterValues | undefined,
    previous: FilterValues | undefined
  ): boolean {
    if (current === previous) {
      return true;
    }

    if (!current || !previous) {
      return false;
    }

    const keys = new Set([...Object.keys(current), ...Object.keys(previous)]);

    for (const key of keys) {
      if (current[key] !== previous[key]) {
        return false;
      }
    }

    return true;
  }
}
