// Type definitions for Vendetta/Bunny Metro API
declare module "@vendetta/metro" {
    export function findByProps(...props: string[]): any;
    export function findByPropsAll(...props: string[]): any[];
    export function findByName(name: string, defaultExp?: boolean): any;
    export function findByNameAll(name: string, defaultExp?: boolean): any[];
    export function findByDisplayName(name: string, defaultExp?: boolean): any;
    export function findByDisplayNameAll(name: string, defaultExp?: boolean): any[];
    export function findByTypeName(name: string, defaultExp?: boolean): any;
    export function findByTypeNameAll(name: string, defaultExp?: boolean): any[];
    export function findByStoreName(name: string): any;
}

declare module "@vendetta/metro/common" {
    export const FluxDispatcher: {
        dispatch(event: any): void;
        subscribe(event: string, callback: (data: any) => void): void;
        unsubscribe(event: string, callback: (data: any) => void): void;
        [key: string]: any;
    };
    export const React: typeof import("react");
    export const ReactNative: any;
    export const stylesheet: any;
    export const channels: any;
    export const i18n: any;
    export const url: any;
    export const toasts: any;
    export const clipboard: any;
    export const assets: any;
    export const invites: any;
    export const commands: any;
    export const navigation: any;
    export const navigationStack: any;
    export const NavigationNative: any;
}
