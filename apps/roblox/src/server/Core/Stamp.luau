--!strict
-- Deterministic Luau port of packages/shared/stamp.md (decorative souvenir only).
local Stamp = {}

Stamp.ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ"
Stamp.SALT = "miraverse-v0"

local COUNTRIES = { LB = true, EG = true, IQ = true, KR = true, FR = true }
local PRIME = 16777619
local MOD = 4294967296

local function fnv1a(payload: string): number
	local h = 2166136261
	for i = 1, #payload do
		h = bit32.bxor(h, string.byte(payload, i))
		local hi = bit32.rshift(h, 16)
		local lo = bit32.band(h, 0xFFFF)
		h = (((hi * PRIME) % 65536) * 65536 + lo * PRIME) % MOD
	end
	return h
end

local function checksum(ccChapter: string, nonce: string): string
	local h = fnv1a(Stamp.SALT .. ccChapter .. nonce)
	local out = ""
	for _ = 1, 4 do
		local idx = h % 30
		out ..= string.sub(Stamp.ALPHABET, idx + 1, idx + 1)
		h = h // 30
	end
	return out
end

Stamp.checksum = checksum

local rng = Random.new()

local function randomNonce(): string
	local out = ""
	for _ = 1, 4 do
		local i = rng:NextInteger(1, 30)
		out ..= string.sub(Stamp.ALPHABET, i, i)
	end
	return out
end

function Stamp.make(cc: string, chapter: number, nonceOverride: string?): string
	assert(COUNTRIES[cc], "invalid country")
	assert(chapter >= 1 and chapter % 1 == 0, "invalid chapter")
	local nonce = nonceOverride or randomNonce()
	assert(#nonce == 4, "invalid nonce")
	local ccChapter = cc .. tostring(chapter)
	return string.format("MV-%s-%s-%s", ccChapter, nonce, checksum(ccChapter, nonce))
end

function Stamp.verify(code: string): boolean
	if type(code) ~= "string" then
		return false
	end
	code = string.upper((string.gsub(code, "^%s+", "")))
	code = (string.gsub(code, "%s+$", ""))
	local cc, chapter, nonce, check = string.match(code, "^MV%-(%u%u)([1-9]%d*)%-(%w%w%w%w)%-(%w%w%w%w)$")
	if not cc or not COUNTRIES[cc] or chapter ~= "1" then
		return false
	end
	for _, part in { nonce, check } do
		for i = 1, 4 do
			if not string.find(Stamp.ALPHABET, string.sub(part, i, i), 1, true) then
				return false
			end
		end
	end
	return checksum(cc .. chapter, nonce) == check
end

return Stamp
