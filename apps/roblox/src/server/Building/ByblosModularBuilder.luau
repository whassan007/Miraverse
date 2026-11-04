--!strict
-- MiraVerse v0.7 (Option A) — Bounded Modular Stone-House Restoration & Plot System (CL06)
-- Enforces grid snapping, plot bounds, allowed modular parts (16-part Byblos kit), quotas, and save deltas.

local ByblosModularBuilder = {}

ByblosModularBuilder.ALLOWED_PARTS = {
    limestone_wall_base = true,
    limestone_corner_pillar = true,
    limestone_triple_arch = true,
    cedar_shutter_left = true,
    cedar_shutter_right = true,
    arched_cedar_door = true,
    terracotta_roof_eave = true,
    terracotta_roof_ridge = true,
    stone_courtyard_bench = true,
    bougainvillea_trellis = true,
    terracotta_olive_jar = true,
    brass_harbor_lantern = true,
    woven_courtyard_rug = true,
    wooden_saj_table = true,
    stone_balustrade = true,
    painted_window_box = true,
}

ByblosModularBuilder.PLOT_BOUNDS_LB = {
    minX = -245,
    maxX = -195,
    minY = 6,
    maxY = 32,
    minZ = -25,
    maxZ = 25,
    gridSnapStuds = 2,
    maxPlacedParts = 20,
}

export type PlacedPartDelta = {
    partId: string,
    x: number,
    y: number,
    z: number,
    rotationDeg: number,
    placedByUserId: number,
}

function ByblosModularBuilder.snapAndValidatePlacement(
    partId: string,
    rawX: number,
    rawY: number,
    rawZ: number,
    rotationDeg: number,
    currentCount: number
): (boolean, string, PlacedPartDelta?)
    if not ByblosModularBuilder.ALLOWED_PARTS[partId] then
        return false, "DISALLOWED_PART_ID", nil
    end
    local b = ByblosModularBuilder.PLOT_BOUNDS_LB
    if currentCount >= b.maxPlacedParts then
        return false, "PLOT_QUOTA_EXCEEDED", nil
    end
    if rawX < b.minX or rawX > b.maxX or rawY < b.minY or rawY > b.maxY or rawZ < b.minZ or rawZ > b.maxZ then
        return false, "OUTSIDE_PLOT_BOUNDARY", nil
    end
    local snap = b.gridSnapStuds
    local sx = math.round(rawX / snap) * snap
    local sy = math.round(rawY / snap) * snap
    local sz = math.round(rawZ / snap) * snap
    local srot = (math.round(rotationDeg / 90) * 90) % 360

    return true, "PLACEMENT_VALID", {
        partId = partId,
        x = sx,
        y = sy,
        z = sz,
        rotationDeg = srot,
        placedByUserId = 0,
    }
end

return ByblosModularBuilder
