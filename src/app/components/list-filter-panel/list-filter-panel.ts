import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActiveFilterChip,
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
  @Input() title = '';
  @Input() subtitle = '';
  @Input() searchLabel = 'Apply';
  @Input() resetLabel = 'Reset';
  @Input() activeFiltersLabel = 'Filtered by';
  @Input() clearAllLabel = 'Clear all';
  @Input() disabled = false;
  @Input() collapsible = false;
  @Input() refineLabel = 'More filters';

  @Output() search = new EventEmitter<ListFilterSearchEvent>();
  @Output() reset = new EventEmitter<ListFilterSearchEvent>();

  draftValues: FilterValues = {};
  filtersExpanded = false;

  private appliedValues: FilterValues = {};

  ngOnChanges(changes: SimpleChanges): void {
    const initialValuesChange = changes['initialValues'];

    const initialValuesChanged =
      !!initialValuesChange &&
      (initialValuesChange.firstChange ||
        !this.areFilterValuesEqual(
          initialValuesChange.currentValue,
          initialValuesChange.previousValue
        ));

    if (initialValuesChanged) {
      this.syncDraftFromInitial();
      this.filtersExpanded = this.collapsible && this.hasActiveAppliedFilters;
    }
  }

  get showHeader(): boolean {
    return !!this.title.trim();
  }

  get searchFields(): ListFilterField[] {
    return this.fields.filter((field) => field.type === 'search');
  }

  get refineFields(): ListFilterField[] {
    return this.fields.filter((field) => field.type !== 'search');
  }

  get selectFields(): ListFilterField[] {
    return this.refineFields.filter((field) => field.type === 'select');
  }

  get buttonGroupFields(): ListFilterField[] {
    return this.refineFields.filter((field) => field.type === 'button-group');
  }

  get hasPendingChanges(): boolean {
    return this.fields.some(
      (field) => this.draftValues[field.key] !== this.appliedValues[field.key]
    );
  }

  get activeChips(): ActiveFilterChip[] {
    return this.fields
      .filter((field) => !this.isDefaultValue(field.key, this.appliedValues[field.key]))
      .map((field) => ({
        key: field.key,
        label: this.getChipLabel(field),
        valueLabel: this.getValueLabel(field, this.appliedValues[field.key]),
      }));
  }

  get hasActiveAppliedFilters(): boolean {
    return this.activeChips.length > 0;
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

  formatOptionLabel(option: { label: string; count?: number }): string {
    if (option.count === undefined || option.count === null) {
      return option.label;
    }

    return `${option.label} (${option.count})`;
  }

  toggleFiltersExpanded(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  onSearch(): void {
    if (this.disabled) {
      return;
    }

    this.appliedValues = { ...this.draftValues };
    this.search.emit({ values: this.appliedValues });
  }

  onReset(): void {
    if (this.disabled) {
      return;
    }

    this.syncDraftFromInitial();
    this.appliedValues = { ...this.draftValues };

    const event: ListFilterSearchEvent = {
      values: this.appliedValues,
    };

    this.reset.emit(event);
    this.search.emit(event);
  }

  onClearAll(): void {
    this.onReset();
  }

  onRemoveChip(key: string): void {
    if (this.disabled) {
      return;
    }

    const defaultValue = this.initialValues[key] ?? null;
    this.draftValues[key] = defaultValue;
    this.appliedValues[key] = defaultValue;
    this.search.emit({ values: { ...this.appliedValues } });
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearch();
    }
  }

  private syncDraftFromInitial(): void {
    this.draftValues = { ...this.initialValues };
    this.appliedValues = { ...this.draftValues };
  }

  private getChipLabel(field: ListFilterField): string {
    return field.chipLabel ?? field.label ?? field.placeholder ?? field.key;
  }

  private isDefaultValue(key: string, value: FilterFieldValue | undefined): boolean {
    const defaultValue = this.initialValues[key] ?? null;
    return value === defaultValue;
  }

  private getValueLabel(field: ListFilterField, value: FilterFieldValue | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const option = field.options?.find((entry) => entry.value === value);
    if (option) {
      return option.label;
    }

    return String(value);
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
