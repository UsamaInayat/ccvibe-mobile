// Type definitions for Vendetta/Bunny Patcher API
declare module "@vendetta/patcher" {
    type BeforeCallback = (args: any[]) => any[] | void;
    type AfterCallback = (args: any[], ret: any) => any;
    type InsteadCallback = (args: any[], orig: Function) => any;

    export function before(
        funcName: string,
        parent: any,
        callback: BeforeCallback
    ): () => void;

    export function after(
        funcName: string,
        parent: any,
        callback: AfterCallback
    ): () => void;

    export function instead(
        funcName: string,
        parent: any,
        callback: InsteadCallback
    ): () => void;
}
