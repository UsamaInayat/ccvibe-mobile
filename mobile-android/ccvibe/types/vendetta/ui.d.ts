// Type definitions for Vendetta/Bunny UI API
declare module "@vendetta/ui/toasts" {
    export function showToast(content: string, options?: { duration?: number }): void;
}

declare module "@vendetta/ui/alerts" {
    export function showConfirmationAlert(options: {
        title: string;
        content: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
    }): void;
}

declare module "@vendetta/ui/assets" {
    export function getAssetIDByName(name: string): number | undefined;
}
