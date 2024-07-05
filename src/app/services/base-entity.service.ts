import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseDto } from '@app/dtos/response.dto';
import { environment } from '@app/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseEntityService {
  constructor(private http: HttpClient) {}

  getEntityData<T>(
    getEndpoint: keyof typeof environment.endpoints
  ): Observable<ResponseDto<T[]>> {
    return this.http.get<ResponseDto<T[]>>(
      (environment.endpoints[getEndpoint] as any)?.get
    );
  }

  saveEntity<T>(
    payload: any,
    saveEndpoint: keyof typeof environment.endpoints
  ): Observable<ResponseDto<T>> {
    return this.http.post<ResponseDto<T>>(
      (environment.endpoints[saveEndpoint] as any)?.save,
      payload
    );
  }
}
