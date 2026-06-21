import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type PaginationPage = number | 'ellipsis';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  @Input({ required: true }) pageNumber!: number;
  @Input({ required: true }) totalPages!: number;
  @Input({ required: true }) totalCount!: number;
  @Input({ required: true }) pageSize!: number;
  @Input() currentItemsCount = 0;
  @Input() disabled = false;
  @Input() itemLabel = 'results';
  @Input() showPageNumbers = true;
  @Input() pageSizeOptions: number[] = [10, 20, 50];
  @Input() pageSizeLabel = 'Show';
  @Input() goToPageLabel = 'Go to page';
  @Input() goToPageThreshold = 8;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  goToPageInput = '';

  get rangeStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return Math.min(this.pageNumber * this.pageSize, this.totalCount);
  }

  get showGoToPage(): boolean {
    return this.totalPages >= this.goToPageThreshold;
  }

  get visiblePages(): PaginationPage[] {
    if (!this.showPageNumbers || this.totalPages <= 1) {
      return [];
    }

    const total = this.totalPages;
    const current = this.pageNumber;

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, total, current]);

    if (current > 1) {
      pages.add(current - 1);
    }

    if (current < total) {
      pages.add(current + 1);
    }

    if (current <= 3) {
      pages.add(2);
      pages.add(3);
      pages.add(4);
    }

    if (current >= total - 2) {
      pages.add(total - 1);
      pages.add(total - 2);
      pages.add(total - 3);
    }

    const sorted = [...pages].sort((a, b) => a - b);
    const result: PaginationPage[] = [];

    for (let index = 0; index < sorted.length; index++) {
      const page = sorted[index];
      const previous = sorted[index - 1];

      if (index > 0 && page - previous > 1) {
        result.push('ellipsis');
      }

      result.push(page);
    }

    return result;
  }

  goToPreviousPage(): void {
    if (this.pageNumber <= 1 || this.disabled) {
      return;
    }

    this.pageChange.emit(this.pageNumber - 1);
  }

  goToNextPage(): void {
    if (this.pageNumber >= this.totalPages || this.disabled) {
      return;
    }

    this.pageChange.emit(this.pageNumber + 1);
  }

  goToPage(page: number): void {
    if (
      this.disabled ||
      page === this.pageNumber ||
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.pageChange.emit(page);
  }

  onPageSizeChange(pageSize: number): void {
    if (this.disabled || pageSize === this.pageSize) {
      return;
    }

    this.pageSizeChange.emit(pageSize);
  }

  onGoToPageSubmit(): void {
    const page = Number.parseInt(this.goToPageInput, 10);

    if (Number.isNaN(page)) {
      return;
    }

    this.goToPage(page);
    this.goToPageInput = '';
  }

  onGoToPageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onGoToPageSubmit();
    }
  }

  isPageNumber(page: PaginationPage): page is number {
    return typeof page === 'number';
  }
}
