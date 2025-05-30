// Define __env to let it be used via typescript
interface Window {
    __env: {
        [key: string]: string | undefined;
    };
}
