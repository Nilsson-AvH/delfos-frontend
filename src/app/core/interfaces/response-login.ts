import { User } from "./user";

export interface ResponseLogin {
    token: string;
    user: User;
}