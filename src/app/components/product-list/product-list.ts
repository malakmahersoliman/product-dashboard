import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList 
{
    searchText = '';
  showOnlyAvailable = false;
  products = []
  // get filteredProducts() {
  //   return this.products.filter(product => {
  //     const matchesSearch = product.name
  //       .toLowerCase()
  //       .includes(this.searchText.toLowerCase());

  //     const matchesStock = this.showOnlyAvailable
  //       ? product.inStock
  //       : true;

  //     return matchesSearch && matchesStock;
  //   });
  // }
  showMessage(){
    alert('product dashboard is working!');
  }
}
