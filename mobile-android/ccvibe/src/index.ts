/*
 * CCVibe Mobile - Auto-translate Roman Hindi/Urdu to English
 * Vendetta/Bunny/Revenge Plugin for Discord Mobile (Android)
 */

import { findByProps } from "@vendetta/metro";
import { before, after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { isLikelyHindiUrdu } from "./detector";
import { translateToEnglish, clearCache } from "./translate";

// Store patches for cleanup
const patches: (() => void)[] = [];

// Translation cache for rendered messages
const translationCache = new Map<string, string>();
const pendingTranslations = new Set<string>();

// =============================================================================
// MESSAGE PROCESSING
// =============================================================================

async function processMessage(content: string): Promise<string> {
    if (!content || content.length < 3) return content;
    if (!isLikelyHindiUrdu(content)) return content;

    // Check cache
    const cached = translationCache.get(content);
    if (cached) return cached;

    // Check if already translating
    if (pendingTranslations.has(content)) return content;

    pendingTranslations.add(content);

    try {
        const result = await translateToEnglish(content);
        pendingTranslations.delete(content);

        if (result.translated !== result.original) {
            // Cache the translation
            translationCache.set(content, result.translated);

            // Format: "translated text [original]" or just translated
            if (storage.showOriginalOnTap) {
                return `${result.translated} [${content}]`;
            }
            return result.translated;
        }
    } catch (error) {
        console.error("[CCVibe] Translation error:", error);
        pendingTranslations.delete(content);
    }

    return content;
}

// =============================================================================
// PLUGIN LIFECYCLE
// =============================================================================

export default {
    onLoad: () => {
        console.log("[CCVibe] Loading plugin...");

        // Initialize default settings
        storage.showOriginalOnTap ??= true;

        // Find Discord modules at load time (not at module init)
        let MessageStore: any = null;
        let MessageActions: any = null;

        try {
            MessageStore = findByProps("getMessage", "getMessages");
            MessageActions = findByProps("receiveMessage");
        } catch (e) {
            console.error("[CCVibe] Failed to find Discord modules:", e);
        }

        // Patch message receiving for new messages
        if (MessageActions?.receiveMessage) {
            try {
                const unpatch = before("receiveMessage", MessageActions, (args) => {
                    const message = args[0];
                    if (message?.content && typeof message.content === "string") {
                        // Check if it's Hindi/Urdu and start translation
                        if (isLikelyHindiUrdu(message.content)) {
                            processMessage(message.content).then(translated => {
                                if (translated !== message.content) {
                                    message.content = translated;
                                }
                            }).catch(e => console.error("[CCVibe] Translation error:", e));
                        }
                    }
                    return args;
                });
                patches.push(unpatch);
                console.log("[CCVibe] Patched receiveMessage");
            } catch (e) {
                console.error("[CCVibe] Failed to patch receiveMessage:", e);
            }
        } else {
            console.log("[CCVibe] MessageActions.receiveMessage not found");
        }

        // Patch getMessage for cached messages
        if (MessageStore?.getMessage) {
            try {
                const unpatch = after("getMessage", MessageStore, (args, message) => {
                    if (!message?.content || typeof message.content !== "string") return message;

                    // Check if we already have a translation
                    const cached = translationCache.get(message.content);
                    if (cached) {
                        return { ...message, content: cached };
                    }

                    // Check if it needs translation and start async translation
                    if (isLikelyHindiUrdu(message.content)) {
                        processMessage(message.content);
                    }

                    return message;
                });
                patches.push(unpatch);
                console.log("[CCVibe] Patched getMessage");
            } catch (e) {
                console.error("[CCVibe] Failed to patch getMessage:", e);
            }
        } else {
            console.log("[CCVibe] MessageStore.getMessage not found");
        }

        console.log("[CCVibe] Plugin loaded!");
    },

    onUnload: () => {
        console.log("[CCVibe] Unloading plugin...");

        // Remove all patches
        for (const unpatch of patches) {
            try {
                unpatch();
            } catch (error) {
                console.error("[CCVibe] Error removing patch:", error);
            }
        }
        patches.length = 0;

        // Clear caches
        translationCache.clear();
        pendingTranslations.clear();
        clearCache();

        console.log("[CCVibe] Plugin unloaded!");
    },
};
