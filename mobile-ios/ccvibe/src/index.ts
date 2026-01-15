/*
 * CCVibe Mobile - Auto-translate Roman Hindi/Urdu to English
 * Vendetta/Bunny/Revenge Plugin for Discord Mobile (iOS)
 */

import { findByProps } from "@vendetta/metro";
import { before, after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import { isLikelyHindiUrdu } from "./detector";
import { translateToEnglish, clearCache } from "./translate";

// Discord's message module
const MessageStore = findByProps("getMessage", "getMessages");
const MessageActions = findByProps("receiveMessage");

// Store patches for cleanup
const patches: (() => void)[] = [];

// Translation cache for rendered messages
const translationCache = new Map<string, string>();
const pendingTranslations = new Set<string>();

// Default settings
storage.showOriginalOnTap ??= true;

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

        // Patch message rendering to translate Hindi/Urdu messages
        if (MessageActions?.receiveMessage) {
            const unpatch = before("receiveMessage", MessageActions, async (args) => {
                try {
                    const message = args[0];
                    if (message?.content && typeof message.content === "string") {
                        const translated = await processMessage(message.content);
                        if (translated !== message.content) {
                            message.content = translated;
                        }
                    }
                } catch (error) {
                    console.error("[CCVibe] Error in receiveMessage patch:", error);
                }
                return args;
            });
            patches.push(unpatch);
        }

        // Alternative: Patch getMessage for cached messages
        if (MessageStore?.getMessage) {
            const unpatch = after("getMessage", MessageStore, (args, message) => {
                if (!message?.content || typeof message.content !== "string") return message;

                try {
                    // Check if we already have a translation
                    const cached = translationCache.get(message.content);
                    if (cached) {
                        return { ...message, content: cached };
                    }

                    // Check if it needs translation
                    if (isLikelyHindiUrdu(message.content)) {
                        // Start async translation (won't affect this render)
                        processMessage(message.content);
                    }
                } catch (error) {
                    console.error("[CCVibe] Error in getMessage patch:", error);
                }

                return message;
            });
            patches.push(unpatch);
        }

        console.log("[CCVibe] Plugin loaded successfully!");
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

    settings: {
        showOriginalOnTap: {
            type: "toggle",
            label: "Show Original on Tap",
            description: "Show original text in brackets after translation",
            default: true,
        },
    },
};
