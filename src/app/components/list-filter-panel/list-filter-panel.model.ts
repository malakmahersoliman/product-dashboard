export type FilterFieldValue = string | number | boolean | null;

export interface FilterFieldOption {
  label: string;
  value: FilterFieldValue;
}

export interface ListFilterField {
  key: string;
  type: 'search' | 'select' | 'button-group';
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
  groupLabel?: string;
  options?: FilterFieldOption[];
  disabled?: boolean;
}

export interface FilterValues {
  [key: string]: FilterFieldValue;
}

export interface ListFilterSearchEvent {
  values: FilterValues;
  pageSize: number;
}
