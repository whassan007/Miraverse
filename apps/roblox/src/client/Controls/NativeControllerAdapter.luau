--!strict
-- MiraVerse v0.7 (Option A) — Native Roblox Humanoid Controller, Camera & Accessibility Adapter (CX06)

local NativeControllerAdapter = {}

export type AccessibilityPreferences = {
    subtitlesEnabled: boolean,
    textSizeScale: number, -- 1.0 to 1.35
    colorIndependentCues: boolean,
    reducedMotion: boolean,
    cameraShakeDisabled: boolean,
    inputMode: "KeyboardMouse" | "Touch" | "Gamepad",
}

function NativeControllerAdapter.defaultPreferences(): AccessibilityPreferences
    return {
        subtitlesEnabled = true,
        textSizeScale = 1.0,
        colorIndependentCues = true,
        reducedMotion = false,
        cameraShakeDisabled = true,
        inputMode = "KeyboardMouse",
    }
end

function NativeControllerAdapter.getPromptLabel(inputMode: string, actionName: string): string
    if inputMode == "Gamepad" then
        return string.format("[ButtonX] %s", actionName)
    elseif inputMode == "Touch" then
        return string.format("[Tap] %s", actionName)
    end
    return string.format("[E] %s", actionName)
end

return NativeControllerAdapter
