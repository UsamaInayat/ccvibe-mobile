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
