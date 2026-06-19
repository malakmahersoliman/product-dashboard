import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-table',
  imports: [CommonModule, DatePipe],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css',
})
export class UserTable {
  users = input.required<User[]>();
}
