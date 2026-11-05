-- Build: ghost blueprint grid; each placed tile validated against the legend.
local Build = {}
Build.__index = Build

local CELL = 4

function Build.start(ctx)
	local ch = ctx.challenge
	local self = setmetatable({
		ctx = ctx,
		required = {}, -- ["r,c"] = item id
		filled = {},
		cells = {},
		remaining = 0,
		selected = nil,
		rows = #ch.blueprint,
		cols = 0,
	}, Build)
	local legend = ch.blueprintLegend or {}
	local origin = ctx.origin() * CFrame.new(0, 0, -14)
	self.origin = origin

	for r, line in ipairs(ch.blueprint) do
		self.cols = math.max(self.cols, #line)
		for c = 1, #line do
			local sym = line:sub(c, c)
			if sym ~= "." and legend[sym] then
				self.required[r .. "," .. c] = legend[sym]
				self.remaining += 1
				local part = ctx.newPart("Ghost", Vector3.new(CELL - 0.2, CELL - 0.2, 0.5), self:cellCFrame(r, c), ctx.itemColor(legend[sym]))
				part.Transparency = 0.7
				part.CanCollide = false
				self.cells[r .. "," .. c] = part
				ctx.click(part, function()
					if not self.selected then
						ctx.say("rbx.choose_block")
						return
					end
					self:place(r, c, self.selected)
				end)
			end
		end
	end

	-- Palette: one pickable block per distinct legend item.
	local seen, i = {}, 0
	for _, id in pairs(legend) do
		if not seen[id] then
			seen[id] = true
			i += 1
			local pal = ctx.newPart("Palette_" .. id, Vector3.new(3, 3, 3), origin * CFrame.new(-8 + i * 4, 1.5, 6), ctx.itemColor(id))
			ctx.label(pal, ctx.itemName(id))
			ctx.click(pal, function()
				self:select(id)
			end)
		end
	end
	ctx.progress({ remaining = self.remaining })
	return self
end

function Build:cellCFrame(r, c)
	local x = (c - (self.cols + 1) / 2) * CELL
	local y = (self.rows - r) * CELL + CELL / 2
	return self.origin * CFrame.new(x, y, 0)
end

function Build:select(id)
	-- Only allow items that appear in the blueprint legend.
	for _, req in pairs(self.required) do
		if req == id then
			self.selected = id
			self.ctx.say("rbx.selected", self.ctx.itemName(id))
			return
		end
	end
end

function Build:place(r, c, id)
	local key = tostring(r) .. "," .. tostring(c)
	local need = self.required[key]
	if not need or self.filled[key] then
		return
	end
	if need ~= id then
		self.ctx.say("rbx.wrong_block")
		return
	end
	self.filled[key] = true
	self.remaining -= 1
	local ghost = self.cells[key]
	if ghost then
		ghost:Destroy()
	end
	local solid = self.ctx.newPart("Tile", Vector3.new(CELL - 0.2, CELL - 0.2, 1), self:cellCFrame(r, c), self.ctx.itemColor(id))
	solid:SetAttribute("ItemId", id)
	self.ctx.progress({ remaining = self.remaining })
	if self.remaining == 0 then
		self.ctx.say("rbx.blueprint_complete")
		self.ctx.finish(true)
	end
end

function Build:onAction(action)
	if action.kind == "select" and type(action.item) == "string" then
		self:select(action.item)
	elseif action.kind == "place" and type(action.row) == "number" and type(action.col) == "number" and type(action.item) == "string" then
		if action.row % 1 == 0 and action.col % 1 == 0 then
			self:place(action.row, action.col, action.item)
		end
	end
end

return Build
