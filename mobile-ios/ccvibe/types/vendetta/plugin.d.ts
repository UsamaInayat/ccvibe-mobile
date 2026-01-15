// Type definitions for Vendetta/Bunny Plugin API
declare module "@vendetta/plugin" {
    export const storage: Record<string, any>;
    export const manifest: {
        name: string;
        description: string;
        authors: Array<{ name: string; id: string }>;
        main: string;
        hash?: string;
    };
}

declare module "@vendetta/storage" {
    export function useProxy<T extends object>(storage: T): T;
    export function createStorage<T extends object>(backend: any): T;
}

declare module "@vendetta/ui" {
    export const Forms: {
        Form: React.ComponentType<any>;
        FormRow: React.ComponentType<any>;
        FormSection: React.ComponentType<any>;
        FormDivider: React.ComponentType<any>;
        FormInput: React.ComponentType<any>;
        FormSwitch: React.ComponentType<any>;
        FormSwitchRow: React.ComponentType<any>;
        FormText: React.ComponentType<any>;
    };
    export const General: {
        Text: React.ComponentType<any>;
        View: React.ComponentType<any>;
        TouchableOpacity: React.ComponentType<any>;
        ScrollView: React.ComponentType<any>;
    };
}
