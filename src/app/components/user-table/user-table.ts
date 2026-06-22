import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-table',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css',
})
export class UserTable {
  users = input.required<User[]>();
  deleteUser = output<number>();
}
