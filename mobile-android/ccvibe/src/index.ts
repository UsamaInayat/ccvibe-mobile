/*
 * CCVibe Mobile - Auto-translate Roman Hindi/Urdu to English
 * Vendetta/Bunny/Revenge Plugin for Discord Mobile
 */

import { findByProps, findByStoreName } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";
import { before } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { isLikelyHindiUrdu } from "./detector";
import { translateToEnglish, clearCache } from "./translate";

// Store patches for cleanup
const patches: (() => void)[] = [];

// Translation cache
const translationCache = new Map<string, string>();

// =============================================================================
// MESSAGE PROCESSING
// =============================================================================

async function processAndUpdateMessage(message: any): Promise<void> {
    if (!message?.content || typeof message.content !== "string") return;
    if (message.content.length < 3) return;
    if (!isLikelyHindiUrdu(message.content)) return;

    const originalContent = message.content;

    // Check cache first
    const cached = translationCache.get(originalContent);
    if (cached) {
        message.content = cached;
        return;
    }

    try {
        console.log("[CCVibe] Translating:", originalContent);
        const result = await translateToEnglish(originalContent);

        if (result.translated !== result.original) {
            const finalText = storage.showOriginalOnTap
                ? `${result.translated} [${originalContent}]`
                : result.translated;

            translationCache.set(originalContent, finalText);
            message.content = finalText;
            console.log("[CCVibe] Translated to:", finalText);
        }
    } catch (error) {
        console.error("[CCVibe] Translation error:", error);
    }
}

// =============================================================================
// PLUGIN LIFECYCLE
// =============================================================================

export default {
    onLoad: () => {
        console.log("[CCVibe] Starting plugin...");

        // Initialize settings
        storage.showOriginalOnTap ??= true;

        // Method 1: Intercept MESSAGE_CREATE events via FluxDispatcher
        try {
            const unpatchCreate = before("dispatch", FluxDispatcher, (args) => {
                const event = args[0];
                if (event?.type === "MESSAGE_CREATE" && event?.message) {
                    processAndUpdateMessage(event.message);
                }
                return args;
            });
            patches.push(unpatchCreate);
            console.log("[CCVibe] Hooked MESSAGE_CREATE");
        } catch (e) {
            console.error("[CCVibe] Failed to hook FluxDispatcher:", e);
        }

        // Method 2: Also try to patch the MessageStore for cached messages
        try {
            const MessageStore = findByStoreName("MessageStore");
            if (MessageStore?.getMessage) {
                const unpatch = before("getMessage", MessageStore, (args) => {
                    return args;
                });
                patches.push(unpatch);
                console.log("[CCVibe] Found MessageStore");
            }
        } catch (e) {
            console.log("[CCVibe] MessageStore not available:", e);
        }

        // Method 3: Try direct module patching
        try {
            const MessageActions = findByProps("sendMessage", "receiveMessage");
            if (MessageActions?.receiveMessage) {
                const unpatch = before("receiveMessage", MessageActions, (args) => {
                    if (args[1]?.message) {
                        processAndUpdateMessage(args[1].message);
                    }
                    return args;
                });
                patches.push(unpatch);
                console.log("[CCVibe] Hooked receiveMessage");
            }
        } catch (e) {
            console.log("[CCVibe] receiveMessage not found:", e);
        }

        console.log("[CCVibe] Plugin loaded with", patches.length, "patches!");
    },

    onUnload: () => {
        console.log("[CCVibe] Unloading...");

        for (const unpatch of patches) {
            try {
                unpatch();
            } catch (e) {
                console.error("[CCVibe] Error unpatching:", e);
            }
        }
        patches.length = 0;
        translationCache.clear();
        clearCache();

        console.log("[CCVibe] Unloaded!");
    },
};
