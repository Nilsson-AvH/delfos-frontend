import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, switchMap, map, tap } from 'rxjs/operators';
import { HttpCompanyDocuments } from '../../../../core/services/http-company-documents';
import { CompanyDocument } from '../../../../core/interfaces/company-document';
import { Router } from '@angular/router';

@Component({
    selector: 'app-document-list',
    imports: [AsyncPipe, DatePipe, ReactiveFormsModule],
    templateUrl: './document-list.html',
    styleUrl: './document-list.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class DocumentList implements OnInit {
    public searchControl = new FormControl('');
    public documents$!: Observable<CompanyDocument[]>;

    private refreshTrigger$ = new BehaviorSubject<void>(undefined);
    public docIdToDelete: string | null = null;

    public currentPage$ = new BehaviorSubject<number>(1);
    public pageSize = 10;
    public totalPages = signal<number>(1);

    private httpCompanyDocs = inject(HttpCompanyDocuments);
    private router = inject(Router);

    ngOnInit() {
        const searchTerm$ = this.searchControl.valueChanges.pipe(
            startWith(''),
            tap(() => {
                if (this.currentPage$.value !== 1) {
                    this.currentPage$.next(1);
                }
            })
        );

        this.documents$ = combineLatest([this.refreshTrigger$.pipe(startWith(undefined)), searchTerm$, this.currentPage$]).pipe(
            switchMap(([_, term, page]) => {
                const normalize = (str: string | null) =>
                    (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

                const searchTerm = normalize(term);

                return this.httpCompanyDocs.getAllCompanyDocuments(page, this.pageSize, searchTerm).pipe(
                    tap(res => {
                        this.totalPages.set(res.totalPages);
                    }),
                    map(res => res.docs)
                );
            })
        );
    }

    goGenerateDoc() {
        this.router.navigate(['/dashboard/documents/generate']);
    }

    firstPage() {
        this.currentPage$.next(1);
    }

    nextPage() {
        if (this.currentPage$.value < this.totalPages()) {
            this.currentPage$.next(this.currentPage$.value + 1);
        }
    }

    prevPage() {
        if (this.currentPage$.value > 1) {
            this.currentPage$.next(this.currentPage$.value - 1);
        }
    }

    lastPage() {
        this.currentPage$.next(this.totalPages());
    }

    onView(url: string) {
        window.open(url, '_blank');
    }

    onDelete(id: string) {
        this.docIdToDelete = id;
    }

    confirmDelete() {
        if (this.docIdToDelete) {
            this.httpCompanyDocs.deleteCompanyDocument(this.docIdToDelete).subscribe({
                next: () => {
                    console.log('Document deleted successfully');
                    this.refreshTrigger$.next();
                    this.closeDeleteModal();
                },
                error: (err) => {
                    console.error('Error deleting document', err);
                    this.closeDeleteModal();
                }
            });
        }
    }

    closeDeleteModal() {
        this.docIdToDelete = null;
    }
}
