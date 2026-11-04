--!strict
-- MiraVerse v0.7 (Option A) — NPC Interaction, Proximity Validation & Localized Mentor Dialogue (CL05)

local MentorDialogueService = {}

MentorDialogueService.MENTORS = {
    LB = {
        mentorId = "npc_teta_nahla",
        nameEn = "Teta Nahla",
        nameNative = "تيتا نهلة",
        position = { x = -212, y = 8, z = 6 },
        maxInteractionStuds = 14,
        greetingEn = "Ahlan ya albi! Welcome to Byblos Harbor. Let's gather fresh za'atar and warm the saj together!",
        greetingNative = "أهلاً يا قلبي! نورتوا جبيل. يلا نجمع الزعتر الأخضر ونحمي الصاج سوا!",
        responseClipId = "mv_interact_gather",
    },
    EG = {
        mentorId = "npc_layla_cairo",
        nameEn = "Auntie Layla",
        nameNative = "خالة ليلى",
        position = { x = 4, y = 8, z = 214 },
        maxInteractionStuds = 14,
        greetingEn = "Ya marhaba! Look how the fanous lanterns glow across our courtyard tonight.",
        greetingNative = "يا مرحبا! شوفوا فوانيس الحارة منورة إزاي الليلة.",
        responseClipId = "mv_interact_gather",
    },
    IQ = {
        mentorId = "npc_noor_baghdad",
        nameEn = "Jiddo Noor",
        nameNative = "جدو نور",
        position = { x = 4, y = 8, z = -214 },
        maxInteractionStuds = 14,
        greetingEn = "Hala wallah by the Tigris! Let's prepare cardamom kleicha under the shanasheel.",
        greetingNative = "هلا والله على شط دجلة! تعالوا نحضر الكليچة بالهيل جوة الشناشيل.",
        responseClipId = "mv_interact_gather",
    },
    KR = {
        mentorId = "npc_jiwoo_jeonju",
        nameEn = "Halmeoni Ji-woo",
        nameNative = "지우 할머니",
        position = { x = 214, y = 8, z = 214 },
        maxInteractionStuds = 14,
        greetingEn = "어서 오세요! Welcome to our hanok courtyard in Jeonju. Let's steam pine-needle songpyeon.",
        greetingNative = "어서 오세요! 전주 한옥 마당에 잘 왔어요. 솔잎 송편을 함께 빚어봐요.",
        responseClipId = "mv_interact_gather",
    },
    FR = {
        mentorId = "npc_camille_lyon",
        nameEn = "Chef Camille",
        nameNative = "Cheffe Camille",
        position = { x = 214, y = 8, z = 6 },
        maxInteractionStuds = 14,
        greetingEn = "Bienvenue à Vieux Lyon! Step through the traboule and let's warm the boulangerie oven.",
        greetingNative = "Bienvenue dans le Vieux Lyon ! Traversez la traboule et allumons le fournil.",
        responseClipId = "mv_interact_gather",
    },
}

function MentorDialogueService.validateInteraction(
    countryId: string,
    playerPos: { x: number, y: number, z: number }
): (boolean, string, any?)
    local mentor = MentorDialogueService.MENTORS[countryId]
    if not mentor then
        return false, "UNKNOWN_MENTOR_COUNTRY", nil
    end
    local dx = playerPos.x - mentor.position.x
    local dy = playerPos.y - mentor.position.y
    local dz = playerPos.z - mentor.position.z
    local dist = math.sqrt(dx * dx + dy * dy + dz * dz)
    if dist > mentor.maxInteractionStuds then
        return false, "OUT_OF_PROXIMITY_RANGE", nil
    end
    return true, "DIALOGUE_OPENED", mentor
end

return MentorDialogueService
