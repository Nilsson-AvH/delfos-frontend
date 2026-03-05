import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyDocument } from '../interfaces/company-document';
import { HttpAuth } from './http-auth';

@Injectable({
    providedIn: 'root'
})
export class HttpCompanyDocuments {

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private httpAuth: HttpAuth
    ) { }

    getAllCompanyDocuments(page: number = 1, limit: number = 10, search: string = ''): Observable<{ docs: CompanyDocument[], total: number, page: number, totalPages: number }> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('search', search);

        return this.http.get<{ docs: CompanyDocument[], total: number, page: number, totalPages: number }>(`${this.apiUrl}/v1/company-documents`, {
            headers: this.httpAuth.getHeader(),
            params
        });
    }

    getDocumentsByOperationalId(id: string): Observable<{ operationalId: string, userBaseId: string, documents: CompanyDocument[] }> {
        return this.http.get<{ operationalId: string, userBaseId: string, documents: CompanyDocument[] }>(`${this.apiUrl}/v1/company-documents/operational/${id}`, {
            headers: this.httpAuth.getHeader()
        });
    }

    deleteCompanyDocument(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/v1/company-documents/${id}`, {
            headers: this.httpAuth.getHeader()
        });
    }
}
