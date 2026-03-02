// Este contrato debe cumplir con todas las formas de respuesta
// que se puedan obtener del backend

// TODO: <> Funcionalidad antes de crear el CreadorSUPERUsers
// export interface User {
//     _id: string;
//     nuip: string;
//     names: string;
//     lastName: string;
//     secondLastName: string;
//     email: string;
//     password: string;
//     // confirmPassword: string;
//     roleRequest: string;
//     jobTitle: string;
//     role: string;
//     status: string;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
//     user: {};
//     profile: {};
// }
// TODO: </> Funcionalidad antes de crear el CreadorSUPERUsers

// src/app/core/interfaces/user.ts

export type UserRole =
    // | 'root'
    | 'superadmin'
    | 'admin'
    | 'auditor'
    | 'registered'
    | 'client'
    | 'operational'
    | 'clientManager';

export type UserStatus = 'active' | 'inactive' | 'suspended';

// 1. Interfaz Base (Datos comunes en User.model.js)
export interface UserBase {
    _id?: string;
    nuip: string;
    name: string;
    names: string;
    lastName: string;
    secondLastName?: string;
    fullName?: string; // Dato compuesto que puede enviar el backend
    email: string;
    role: UserRole;
    status: UserStatus;
    password?: string; // Opcional porque en edición no siempre se envía
    user: {};
    profile: {};
}

// 2. Perfil Administrativo (AdministrativeUser.model.js)
export interface AdministrativeProfile {
    jobTitle: string;
}

// 3. Perfil Operativo (OperationalUser.model.js)
export interface OperationalProfile {
    currentClient?: string; // ID del cliente
    currentContract?: string; // ID del contrato
    currentSocialSecurity?: string; // ID seguridad social
    birthDate: string; // Date string
    birthPlace: string;
    issueDate: string;
    issuePlace: string;
    nationality: string;
    gender: 'Mujer' | 'Hombre';
    maritalStatus: 'Soltero' | 'Casado' | 'Union Libre' | 'Divorciado' | 'Viudo';
    height: number;
    weight: number;
    address: string;
    neighborhood: string;
    housingType: 'Propio' | 'Familiar' | 'Alquilado' | 'Otro';
    phones: string[];
    emergencyContact: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    hasVehicle: boolean;
    vehicleType: 'Moto' | 'Carro' | 'Bicicleta' | 'Otro';
    driversLicense: boolean;
    licenseCategory: 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'N/A';

}

// 4. Perfil Manager de Cliente (ClientManagerUser.model.js)
export interface ClientManagerProfile {
    birthDate: string;
    birthPlace: string;
    issueDate: string;
    issuePlace: string;
    nationality: string;
    phones: string[];
    address?: string;
}

// 5. Tipo Unión para el Formulario
// Esto permite que el objeto 'User' pueda tener propiedades de cualquiera
export type User = UserBase & Partial<AdministrativeProfile> & Partial<OperationalProfile> & Partial<ClientManagerProfile>;
