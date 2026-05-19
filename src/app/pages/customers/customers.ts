import { Component, OnInit ,ChangeDetectorRef, inject} from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customers',
  imports: [RouterLink],
  providers: [CustomerService],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
    customers: Customer[] = [];
    isLoading = false;
    errorMessage:  string | null = null;
    successMessage: string | null = null;
    private customerService = inject(CustomerService);
    private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
      this.loadCustomers();
  }
    loadCustomers(){
     this.isLoading = true;
      this.errorMessage='';

      this.customerService.getCustomers().subscribe({

      next: (response) => {
          this.customers = response;
          this.isLoading = false;
          this.cdr.markForCheck();
                
        },
        error: () => {
          this.errorMessage = 'Failed to load customers. Please try again later.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
       });

  }
}
