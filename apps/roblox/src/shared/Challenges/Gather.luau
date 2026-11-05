-- Gather: spawn collectible parts per needed item; count touches server-side.
local Gather = {}
Gather.__index = Gather

function Gather.start(ctx)
	local self = setmetatable({ ctx = ctx, need = {}, got = {}, order = {} }, Gather)
	for _, n in ipairs(ctx.challenge.needs or {}) do
		self.need[n.item] = (self.need[n.item] or 0) + n.count
		self.got[n.item] = self.got[n.item] or 0
		table.insert(self.order, n.item)
	end

	local origin = ctx.origin()
	local total, idx = 0, 0
	for _, c in pairs(self.need) do
		total += c
	end
	for _, item in ipairs(self.order) do
		for _ = 1, self.need[item] do
			if idx >= total then
				break
			end
			idx += 1
			local angle = (idx / math.max(total, 1)) * math.pi - math.pi / 2
			local pos = origin * CFrame.new(math.sin(angle) * 12, 1.5, -8 - math.cos(angle) * 6)
			local part = ctx.newPart("Collect_" .. item, Vector3.new(2, 2, 2), pos, ctx.itemColor(item))
			part.Shape = Enum.PartType.Ball
			part.CanCollide = false
			part:SetAttribute("ItemId", item)
			ctx.label(part, ctx.itemName(item))
			local taken = false
			ctx.connect(part.Touched:Connect(function(hit)
				if taken or ctx.playerFromPart(hit) ~= ctx.player then
					return
				end
				taken = true
				part:Destroy()
				self:collect(item)
			end))
		end
	end
	self:report()
	return self
end

function Gather:collect(item)
	if self.got[item] >= self.need[item] then
		return
	end
	self.got[item] += 1
	self.ctx.say("rbx.collected", self.ctx.itemName(item))
	self:report()
	for id, n in pairs(self.need) do
		if self.got[id] < n then
			return
		end
	end
	for id, n in pairs(self.got) do
		self.ctx.grant(id, n)
	end
	self.ctx.finish(true)
end

function Gather:report()
	local p = {}
	for id, n in pairs(self.need) do
		p[id] = { have = self.got[id], need = n }
	end
	self.ctx.progress(p)
end

-- Collection is touch-driven; client actions are ignored.
function Gather:onAction() end

return Gather
