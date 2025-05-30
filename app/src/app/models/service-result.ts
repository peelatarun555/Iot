export class ServiceResult {
    errorCode = 0;
    errorMsg!: string;
    status = 200;
    data!: any;
    total!: number;
    constructor() {}
}
