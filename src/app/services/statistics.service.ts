import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatisticsResponse } from '../models/statistics.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/statistics`;

  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(this.apiUrl);
  }
}
