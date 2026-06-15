import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PaginationPage = number | 'ellipsis';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  @Input({ required: true }) pageNumber!: number;
  @Input({ required: true }) totalPages!: number;
  @Input({ required: true }) totalCount!: number;
  @Input() currentItemsCount = 0;
  @Input() disabled = false;
  @Input() itemLabel = 'items';
  @Input() showPageNumbers = true;

  @Output() pageChange = new EventEmitter<number>();

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

  isPageNumber(page: PaginationPage): page is number {
    return typeof page === 'number';
  }
}
