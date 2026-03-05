import { CompanyDocument } from './company-document';

export interface GenerateDocReq {
    userId: string;
}

export interface GeneratePresentationLetterReq extends GenerateDocReq {
    startDate: string;
}

export interface GenerateDocResponse {
    msg: string;
    url: string;
    document: CompanyDocument;
}
