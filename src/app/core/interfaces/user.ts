// Este contrato debe cumplir con todas las formas de respuesta
// que se puedan obtener del backend

export interface User {
    _id: string;
    nuip: string;
    names: string;
    lastName: string;
    secondLastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    roleRequest: string;
    jobTitle: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
