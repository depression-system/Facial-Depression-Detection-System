export {};

declare global {
    interface Window {
        electronAPI: {
            saveBuffer: (buffer: ArrayBuffer) =>  Promise<string>,
            startAnalysis: (filePath: string) =>  Promise<any>,
        };
    }
}
