interface IAdminRequest {
    index: number;
    take: number;

    orderBy: string;
    ascending: boolean;
}

export default IAdminRequest;
