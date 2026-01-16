/*
 * CCVibe Mobile - Auto-translate Roman Hindi/Urdu to English
 * Vendetta/Bunny/Revenge Plugin for Discord Mobile
 */

import { findByProps, findByStoreName } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";
import { isLikelyHindiUrdu } from "./detector";
import { translateToEnglish, clearCache } from "./translate";

// Store patches for cleanup
const patches: (() => void)[] = [];

// Translation cache
const translationCache = new Map<string, string>();

// Helper to show debug toasts
function debugToast(msg: string) {
    try {
        showToast?.(msg, { duration: 2000 });
    } catch (e) {
        // Toast not available
    }
    console.log("[CCVibe]", msg);
}

// =============================================================================
// MESSAGE PROCESSING
// =============================================================================

async function processAndUpdateMessage(message: any): Promise<void> {
    if (!message?.content || typeof message.content !== "string") return;
    if (message.content.length < 3) return;

    // Check if Hindi/Urdu
    if (!isLikelyHindiUrdu(message.content)) return;

    const originalContent = message.content;
    debugToast(`Detected: ${originalContent.substring(0, 30)}...`);

    // Check cache first
    const cached = translationCache.get(originalContent);
    if (cached) {
        message.content = cached;
        return;
    }

    try {
        const result = await translateToEnglish(originalContent);

        if (result.translated !== result.original) {
            const finalText = storage.showOriginalOnTap
                ? `${result.translated} [${originalContent}]`
                : result.translated;

            translationCache.set(originalContent, finalText);
            message.content = finalText;
            debugToast(`Translated!`);
        }
    } catch (error) {
        debugToast(`Error: ${error}`);
    }
}

// =============================================================================
// PLUGIN LIFECYCLE
// =============================================================================

export default {
    onLoad: () => {
        debugToast("CCVibe loading...");

        // Initialize settings
        storage.showOriginalOnTap ??= true;

        let hookCount = 0;

        // Method 1: FluxDispatcher - intercept all dispatch events
        try {
            if (FluxDispatcher && typeof FluxDispatcher.dispatch === "function") {
                const unpatch = before("dispatch", FluxDispatcher, (args) => {
                    const event = args[0];
                    if (event?.type === "MESSAGE_CREATE" && event?.message) {
                        processAndUpdateMessage(event.message);
                    }
                    return args;
                });
                patches.push(unpatch);
                hookCount++;
                debugToast("Hooked FluxDispatcher");
            }
        } catch (e) {
            debugToast(`FluxDispatcher failed: ${e}`);
        }

        // Method 2: Subscribe to MESSAGE_CREATE
        try {
            if (FluxDispatcher?.subscribe) {
                const handler = (data: any) => {
                    if (data?.message) {
                        processAndUpdateMessage(data.message);
                    }
                };
                FluxDispatcher.subscribe("MESSAGE_CREATE", handler);
                patches.push(() => FluxDispatcher.unsubscribe("MESSAGE_CREATE", handler));
                hookCount++;
                debugToast("Subscribed MESSAGE_CREATE");
            }
        } catch (e) {
            debugToast(`Subscribe failed: ${e}`);
        }

        // Method 3: Try MessageActions
        try {
            const MessageActions = findByProps("sendMessage", "receiveMessage");
            if (MessageActions?.receiveMessage) {
                const unpatch = before("receiveMessage", MessageActions, (args) => {
                    const channelId = args[0];
                    const data = args[1];
                    if (data?.message) {
                        processAndUpdateMessage(data.message);
                    }
                    return args;
                });
                patches.push(unpatch);
                hookCount++;
                debugToast("Hooked receiveMessage");
            }
        } catch (e) {
            // Silent fail
        }

        // Method 4: Try MessageStore
        try {
            const MessageStore = findByStoreName("MessageStore");
            if (MessageStore) {
                debugToast("Found MessageStore");
            }
        } catch (e) {
            // Silent fail
        }

        debugToast(`CCVibe loaded! (${hookCount} hooks)`);
    },

    onUnload: () => {
        debugToast("CCVibe unloading...");

        for (const unpatch of patches) {
            try {
                unpatch();
            } catch (e) {
                // Ignore
            }
        }
        patches.length = 0;
        translationCache.clear();
        clearCache();

        debugToast("CCVibe unloaded!");
    },
};
