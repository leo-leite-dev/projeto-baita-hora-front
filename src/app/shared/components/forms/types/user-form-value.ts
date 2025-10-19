export type AddressFormValue = {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
};

export type ProfileFormValue = {
    fullName: string;
    cpf: string;
    rg: string | null;
    phone: string;
    birthDate: Date | null;
    address: AddressFormValue;
};

export type UserFormValue = {
    email: string;
    username: string;
    rawPassword: string;
    confirmPassword: string;
    profile: ProfileFormValue;
};