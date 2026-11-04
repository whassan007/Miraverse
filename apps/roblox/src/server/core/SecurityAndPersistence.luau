--!strict
-- MiraVerse v0.4 Roblox Persistence, Remotes Anti-Exploit & Commerce Boundary
-- Owner: CL06
-- Strictly forbids external payment links, Stripe URLs, QR codes, or web gift codes.
-- Optional Roblox-native MarketplaceService module is disabled by default.
local SecurityAndPersistence = {}

SecurityAndPersistence.ENABLE_ROBLOX_MONETIZATION = false
SecurityAndPersistence.ALLOW_EXTERNAL_PAYMENT_LINKS = false
SecurityAndPersistence.MAX_INTERACT_DISTANCE_STUDS = 24
SecurityAndPersistence.COOLDOWN_SECONDS = 0.25

function SecurityAndPersistence.validateRemotePayload(payload: any): (boolean, string)
	if type(payload) ~= "table" then
		return false, "INVALID_TABLE"
	end
	if type(payload.country) ~= "string" or type(payload.action) ~= "string" then
		return false, "MISSING_FIELDS"
	end
	if payload.action == "EXTERNAL_CHECKOUT" or payload.action == "WEB_GIFT_REDEEM" then
		return false, "FORBIDDEN_EXTERNAL_COMMERCE"
	end
	return true, "OK"
end

return SecurityAndPersistence
