--!nonstrict
-- Player journey for the Phoenicia slice, with the game engine behind a host table.
-- Mirrors apps/minecraft/scripts/src/phoenicia/flow.ts.
--
-- host.load(id) -> (ok, value)        ok=false means the store failed, not "no save yet"
-- host.save(id, value) -> boolean
-- host.position(id) -> { region, x, z }?
-- host.teleport(id, region, point)
-- host.ask(id, request) -> optionId?  yields until the player answers
-- host.say(id, text)
-- host.sail(id, fromRegion?, toRegion, seconds)  yields until the voyage ends

local Flow = {}
Flow.__index = Flow

function Flow.new(host, gate, content)
	return setmetatable({ host = host, gate = gate, content = content, sessions = {} }, Flow)
end

function Flow:translate(locale, key: string): string
	local entry = self.content.strings[key]
	if not entry then
		return key
	end
	local fallback = self.content.fallbackLocale
	return entry[locale or fallback] or entry[fallback] or key
end

function Flow:_t(session, key: string): string
	return self:translate(session.state.locale, key)
end

function Flow:_persist(playerId, session)
	if session.saveDisabled then
		return
	end
	if not self.host.save(playerId, session.state) then
		self.host.say(playerId, self:_t(session, "ui.save_failed"))
	end
end

function Flow:getState(playerId)
	local session = self.sessions[playerId]
	return session and session.state
end

function Flow:leave(playerId)
	self.sessions[playerId] = nil
end

function Flow:_direction(session): string
	local locale = session.state.locale or self.content.fallbackLocale
	return self.content.locales[locale].direction
end

function Flow:enter(playerId)
	local ok, value = self.host.load(playerId)
	local parsed = ok and self.gate:parseState(value) or nil
	local session = {
		state = parsed or self.gate:createState(playerId),
		-- After a failed load, writing could overwrite real progress with a fresh save.
		saveDisabled = not ok,
		busy = true,
	}
	self.sessions[playerId] = session

	local success, err = pcall(function()
		if session.saveDisabled then
			self.host.say(playerId, self:_t(session, "ui.save_failed"))
		end
		if not session.state.locale then
			local options = {}
			for _, id in { "en-US", "ar-LB", "fr-FR", "arabizi" } do
				table.insert(options, { id = id, label = self.content.locales[id].label })
			end
			local picked = self.host.ask(playerId, {
				title = self:_t(session, "ui.choose_language"),
				body = "",
				options = options,
				direction = "ltr",
			})
			session.state.locale = picked or self.content.fallbackLocale
		end
		local region = self.content.regions[session.state.region]
		if not session.state.arrived then
			session.state.arrived = true
			self:_persist(playerId, session)
			self.host.sail(playerId, nil, session.state.region, 6)
			self.host.teleport(playerId, session.state.region, region.points.arrival)
			self.host.say(playerId, self:_t(session, "ui.arrival"))
		else
			self.host.teleport(playerId, session.state.region, region.points.resume)
			self.host.say(playerId, self:_t(session, "ui.welcome_back"))
		end
	end)
	session.busy = false
	if not success then
		error(err)
	end
end

-- The action available at the player's current position, if any.
function Flow:promptFor(playerId): string?
	local session = self.sessions[playerId]
	local pos = self.host.position(playerId)
	if not session or not pos or session.busy then
		return nil
	end
	local current = self.gate:currentNode(session.state)
	local nodes = self.gate.quest.nodes
	local anchor = (current or nodes[#nodes]).anchor
	local dx, dz = pos.x - anchor.x, pos.z - anchor.z
	if pos.region ~= anchor.region or dx * dx + dz * dz > anchor.radius * anchor.radius then
		return nil
	end
	return self:_t(session, current and current.promptKey or "prompt.codex")
end

function Flow:interact(playerId)
	local session = self.sessions[playerId]
	if not session or session.busy or not self:promptFor(playerId) then
		return
	end
	session.busy = true
	local success, err = pcall(function()
		local node = self.gate:currentNode(session.state)
		if node then
			self:_playNode(playerId, session, node)
		else
			self:_showCodex(playerId, session)
		end
	end)
	session.busy = false
	if not success then
		error(err)
	end
end

function Flow:_playNode(playerId, session, node)
	while true do
		local options = {}
		for _, option in node.options do
			table.insert(options, { id = option.id, label = self:_t(session, option.labelKey) })
		end
		local choiceId = self.host.ask(playerId, {
			title = self:_t(session, node.titleKey),
			body = self:_t(session, node.bodyKey) .. "\n\n" .. self:_t(session, node.hintKey),
			options = options,
			direction = self:_direction(session),
		})
		if choiceId == nil or self.sessions[playerId] ~= session then
			return
		end
		local pos = self.host.position(playerId)
		if not pos then
			return
		end
		session.state.eventSeq += 1
		local code = self.gate:applyEvent(session.state, {
			eventId = node.id .. ":" .. session.state.eventSeq,
			nodeId = node.id,
			region = pos.region,
			x = pos.x,
			z = pos.z,
			choiceId = choiceId,
		})
		if code == "WRONG_CHOICE" then
			self:_persist(playerId, session)
			for _, option in node.options do
				if option.id == choiceId then
					self.host.say(playerId, self:_t(session, option.feedbackKey))
				end
			end
		elseif code ~= "OK" and code ~= "QUEST_COMPLETED" then
			return
		else
			-- Saving first means a disconnect while sailing resumes at the destination.
			self:_persist(playerId, session)
			self.host.say(playerId, self:_t(session, node.successKey))
			if node.routeId then
				local route = self.content.routes[node.routeId]
				self.host.sail(playerId, route.from, route.to, route.gameSeconds)
				self.host.teleport(playerId, route.to, self.content.regions[route.to].points.arrival)
			end
			if code == "QUEST_COMPLETED" then
				self.host.say(playerId, self:_t(session, "ui.reward"))
			end
			return
		end
	end
end

function Flow:_showCodex(playerId, session)
	local lines = {}
	for _, entry in self.gate.quest.codex do
		local class = self:_t(session, "class." .. entry.classification)
		table.insert(lines, "[" .. class .. "]\n" .. self:_t(session, entry.textKey))
	end
	self.host.ask(playerId, {
		title = self:_t(session, "codex.title"),
		body = table.concat(lines, "\n\n"),
		options = { { id = "close", label = self:_t(session, "ui.continue") } },
		direction = self:_direction(session),
	})
end

return Flow
