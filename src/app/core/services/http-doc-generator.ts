import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GenerateDocReq, GeneratePresentationLetterReq, GenerateDocResponse } from '../interfaces/doc-generator';
import { HttpAuth } from './http-auth';

@Injectable({
    providedIn: 'root'
})
export class HttpDocGenerator {

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private httpAuth: HttpAuth
    ) { }

    generateContract(payload: GenerateDocReq): Observable<GenerateDocResponse> {
        return this.http.post<GenerateDocResponse>(`${this.apiUrl}/v1/generator/contract`, payload, {
            headers: this.httpAuth.getHeader()
        });
    }

    generateCertificate(payload: GenerateDocReq): Observable<GenerateDocResponse> {
        return this.http.post<GenerateDocResponse>(`${this.apiUrl}/v1/generator/certificate`, payload, {
            headers: this.httpAuth.getHeader()
        });
    }

    generateCarnet(payload: GenerateDocReq): Observable<GenerateDocResponse> {
        return this.http.post<GenerateDocResponse>(`${this.apiUrl}/v1/generator/carnet`, payload, {
            headers: this.httpAuth.getHeader()
        });
    }

    generatePresentationLetter(payload: GeneratePresentationLetterReq): Observable<GenerateDocResponse> {
        return this.http.post<GenerateDocResponse>(`${this.apiUrl}/v1/generator/presentation-letter`, payload, {
            headers: this.httpAuth.getHeader()
        });
    }
}
