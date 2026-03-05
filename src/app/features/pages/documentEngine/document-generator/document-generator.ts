import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpDocGenerator } from '../../../../core/services/http-doc-generator';
import { HttpUsers } from '../../../../core/services/http-users';
import { User } from '../../../../core/interfaces/user';

@Component({
    selector: 'app-document-generator',
    imports: [ReactiveFormsModule],
    templateUrl: './document-generator.html',
    styleUrl: './document-generator.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export default class DocumentGenerator implements OnInit {
    private fb = inject(FormBuilder);
    private httpDocGen = inject(HttpDocGenerator);
    private httpUsers = inject(HttpUsers);
    private router = inject(Router);

    public formData: FormGroup;
    public searchControl = new FormControl('');
    public showDropdown = signal<boolean>(false);
    public searchTerm = signal<string>('');

    public operationalUsers = signal<Partial<User>[]>([]);

    public filteredUsers = computed(() => {
        const term = this.searchTerm().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const users = this.operationalUsers();
        if (!term) return users;
        return users.filter(u => {
            const searchStr = `${u.nuip || ''} ${u.names || ''} ${u.lastName || ''}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return searchStr.includes(term);
        });
    });

    public isSubmitting = signal<boolean>(false);
    public successResult = signal<{ msg: string, url: string } | null>(null);

    constructor() {
        this.formData = this.fb.group({
            userId: ['', [Validators.required]],
            docType: ['', [Validators.required]],
            startDate: ['']
        });

        // Validations logic
        this.formData.get('docType')?.valueChanges.subscribe(type => {
            const startDateCtrl = this.formData.get('startDate');
            if (type === 'presentation-letter') {
                startDateCtrl?.setValidators([Validators.required]);
            } else {
                startDateCtrl?.clearValidators();
            }
            startDateCtrl?.updateValueAndValidity();
        });

        this.searchControl.valueChanges.subscribe(val => {
            this.searchTerm.set(val || '');
            this.showDropdown.set(true);
            if (!val) {
                this.formData.patchValue({ userId: '' });
            }
        });
    }

    ngOnInit() {
        this.httpUsers.getUsersByRole('operational').subscribe({
            next: (users) => {
                this.operationalUsers.set(users);
            },
            error: (err) => {
                console.error('Failed to fetch operational users', err);
            }
        });
    }

    goBack() {
        this.router.navigate(['/dashboard/documents']);
    }

    onBlur() {
        setTimeout(() => this.showDropdown.set(false), 200);
    }

    selectUser(user: Partial<User>) {
        this.formData.patchValue({ userId: user._id });
        this.searchControl.setValue(`${user.nuip} - ${user.names} ${user.lastName}`, { emitEvent: false });
        this.showDropdown.set(false);
    }

    get isPresentationLetter() {
        return this.formData.get('docType')?.value === 'presentation-letter';
    }

    onSubmit() {
        if (this.formData.invalid) return;

        this.isSubmitting.set(true);
        this.successResult.set(null);

        const { userId, docType, startDate } = this.formData.value;

        let request$;
        if (docType === 'contract') {
            request$ = this.httpDocGen.generateContract({ userId });
        } else if (docType === 'certificate') {
            request$ = this.httpDocGen.generateCertificate({ userId });
        } else if (docType === 'carnet') {
            request$ = this.httpDocGen.generateCarnet({ userId });
        } else if (docType === 'presentation-letter') {
            request$ = this.httpDocGen.generatePresentationLetter({ userId, startDate });
        }

        if (request$) {
            request$.subscribe({
                next: (res) => {
                    this.successResult.set({ msg: res.msg, url: res.url });
                    this.isSubmitting.set(false);
                    this.formData.reset();
                },
                error: (err) => {
                    console.error('Error generating document:', err);
                    let errorMsg = 'Error generating document. Check if the user has a client and active contract.';
                    if (err.error && err.error.msg) errorMsg = err.error.msg;
                    alert('Error: ' + errorMsg);
                    this.isSubmitting.set(false);
                }
            });
        } else {
            this.isSubmitting.set(false);
        }
    }
}
