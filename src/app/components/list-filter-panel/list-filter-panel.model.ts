export type FilterFieldValue = string | number | boolean | null;

export interface FilterFieldOption {
  label: string;
  value: FilterFieldValue;
  count?: number;
}

export interface ListFilterField {
  key: string;
  type: 'search' | 'select' | 'button-group';
  label?: string;
  chipLabel?: string;
  placeholder?: string;
  ariaLabel?: string;
  groupLabel?: string;
  group?: string;
  options?: FilterFieldOption[];
  disabled?: boolean;
}

export interface FilterValues {
  [key: string]: FilterFieldValue;
}

export interface ListFilterSearchEvent {
  values: FilterValues;
}

export interface ActiveFilterChip {
  key: string;
  label: string;
  valueLabel: string;
}
