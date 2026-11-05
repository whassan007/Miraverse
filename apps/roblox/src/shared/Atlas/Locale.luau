--!nonstrict
-- Looks up translated strings, falling back to English and then to the key itself.
local Locale = {}

local DEFAULT = "en-US"
local tables = {}

local function tableFor(id: string)
	local cached = tables[id]
	if cached then
		return cached
	end
	local module = script.Parent.Locales:FindFirstChild(id)
	if not module then
		return nil
	end
	local loaded = require(module)
	tables[id] = loaded
	return loaded
end

function Locale.get(id: string?, key: string, ...): string
	local selected = id and tableFor(id)
	local text = selected and selected[key]
	if not text then
		local english = tableFor(DEFAULT)
		text = english and english[key] or key
	end
	if select("#", ...) > 0 then
		local args = { ... }
		-- Translators may reorder or drop a %s, so substitute instead of using string.format.
		local index = 0
		text = string.gsub(text, "%%s", function()
			index += 1
			return tostring(args[index] or "")
		end)
	end
	return text
end

-- Vocabulary is stored as "native (pronunciation) — meaning"; this returns the meaning.
function Locale.meaning(id: string?, key: string): string
	local text = Locale.get(id, key)
	local _, finish = string.find(text, " — ", 1, true)
	return finish and string.sub(text, finish + 1) or text
end

return Locale
