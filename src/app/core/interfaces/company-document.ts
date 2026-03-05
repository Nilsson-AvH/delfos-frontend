import { User } from './user';

export interface CompanyDocument {
    _id: string;
    user: User | string;
    generatedBy: User | string;
    documentType: string;
    fileUrl: string;
    publicId: string;
    description?: string;
    storageProvider?: string;
    createdAt?: string;
    updatedAt?: string;
}
