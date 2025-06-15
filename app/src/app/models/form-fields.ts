import { ValidatorFn } from '@angular/forms';

// Note **: for now dynamic form only supports text input and drop down selection.
// You can extend dynamic-form.html template to include more types.
// Use ng Ant design components for easy styling and match existing implementation
export interface FormField {
    type: string; // Input type (text, email, select, etc.)
    label: string;
    controlName: string;
    placeholder?: string;
    options?: OptionType[] | string[] | any[]; // For select or radio
    // Add other properties for validation, default values, etc.
    isRequired?: boolean;
    validatorFn?: ValidatorFn[];
}

export interface OptionType {
    id: number;
    label: string;
}
