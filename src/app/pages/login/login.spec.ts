import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';
import { environment } from '../../../environments/environment';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation errors without calling the API', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBeNull();
    expect(component.loginForm.get('email')?.touched).toBe(true);
    expect(component.loginForm.get('password')?.touched).toBe(true);
    httpMock.expectNone(`${environment.apiUrl}/auth/login`);
  });

  it('should show invalid credentials message on 401', async () => {
    component.loginForm.setValue({
      email: 'wrong@store.com',
      password: 'WrongPass1!',
    });

    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBe('Invalid email or password.');

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Invalid email or password.');
  });

  it('should show a server unreachable message when the API is offline', async () => {
    component.loginForm.setValue({
      email: 'admin@store.com',
      password: 'Admin123!',
    });

    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('Unable to reach the server');
  });

  it('should navigate to products on successful login', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loginForm.setValue({
      email: 'admin@store.com',
      password: 'Admin123!',
    });

    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({
      token: 'test-token',
      email: 'admin@store.com',
      role: 'SuperAdmin',
    });

    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
    expect(component.errorMessage()).toBeNull();
  });
});
