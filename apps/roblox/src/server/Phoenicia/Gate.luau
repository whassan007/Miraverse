--!nonstrict
-- Server-side validation in front of the quest state machine for Phoenicia quests.
-- Mirrors apps/minecraft/scripts/src/phoenicia/gate.ts; tests/phoenicia/vectors.json checks both.
-- Dependencies are passed in so this runs under Lune as well as on a Roblox server.

local Gate = {}
Gate.__index = Gate

local QUEST_ID = "TYR-05"
local SAVE_VERSION = 1
local MAX_PROCESSED_EVENTS = 64

Gate.QUEST_ID = QUEST_ID
Gate.SAVE_VERSION = SAVE_VERSION

function Gate.new(machine, content)
	local self = setmetatable({}, Gate)
	self.machine = machine
	self.content = content
	self.quest = content.quests[QUEST_ID]
	return self
end

function Gate:createState(userId: number)
	return {
		schemaVersion = SAVE_VERSION,
		region = self.quest.hub,
		record = self.machine.newDefinedRecord(userId, self.quest.countryCode, QUEST_ID),
		lifecycle = "AVAILABLE",
		attempts = 0,
		processedEventIds = {},
		storySparks = 0,
		artifacts = {},
		arrived = false,
		locale = nil,
		eventSeq = 0,
	}
end

-- Returns nil for anything that is not a valid save of this version.
function Gate:parseState(raw)
	if type(raw) ~= "table" or raw.schemaVersion ~= SAVE_VERSION then
		return nil
	end
	if type(raw.region) ~= "string" or type(self.content.regions[raw.region]) ~= "table" then
		return nil
	end
	local record = raw.record
	if type(record) ~= "table" or record.questId ~= QUEST_ID or type(record.completedSteps) ~= "table" then
		return nil
	end
	if type(record.currentStepIndex) ~= "number" or type(record.grantedEventIds) ~= "table" then
		return nil
	end
	if type(raw.processedEventIds) ~= "table" or type(raw.artifacts) ~= "table" or type(raw.storySparks) ~= "number" then
		return nil
	end
	return raw
end

function Gate:currentNode(state)
	local id = self.quest.nodeOrder[state.record.currentStepIndex]
	return id and self:findNode(id) or nil
end

function Gate:findNode(id)
	for _, node in self.quest.nodes do
		if node.id == id then
			return node
		end
	end
	return nil
end

local function remember(state, eventId: string)
	table.insert(state.processedEventIds, eventId)
	if #state.processedEventIds > MAX_PROCESSED_EVENTS then
		table.remove(state.processedEventIds, 1)
	end
end

function Gate:applyEvent(state, e): string
	if
		type(e) ~= "table"
		or type(e.eventId) ~= "string"
		or #e.eventId < 4
		or type(e.nodeId) ~= "string"
		or type(e.region) ~= "string"
		or type(e.x) ~= "number"
		or type(e.z) ~= "number"
	then
		return "INVALID_EVENT"
	end
	if table.find(state.processedEventIds, e.eventId) then
		return "DUPLICATE_EVENT"
	end
	if state.lifecycle == "COMPLETED" then
		return "ALREADY_COMPLETE"
	end

	local node = self:findNode(e.nodeId)
	if not node then
		return "UNKNOWN_NODE"
	end
	local current = self:currentNode(state)
	if not current or current.id ~= node.id then
		return "OUT_OF_ORDER"
	end

	local anchor = node.anchor
	if state.region ~= anchor.region or e.region ~= anchor.region then
		return "WRONG_REGION"
	end
	local dx, dz = e.x - anchor.x, e.z - anchor.z
	if dx * dx + dz * dz > anchor.radius * anchor.radius then
		return "OUT_OF_RANGE"
	end

	local option = nil
	for _, candidate in node.options do
		if candidate.id == e.choiceId then
			option = candidate
			break
		end
	end
	if not option then
		return "INVALID_CHOICE"
	end

	if not option.correct then
		state.attempts += 1
		remember(state, e.eventId)
		return "WRONG_CHOICE"
	end

	local ok, machineCode = self.machine.submitDefinedNode(state.record, self.quest.nodeOrder, e.eventId, node.id)
	if not ok then
		return "OUT_OF_ORDER"
	end
	remember(state, e.eventId)
	if node.arriveRegion then
		state.region = node.arriveRegion
	end
	if machineCode ~= "CHAPTER_COMPLETED" then
		state.lifecycle = "OBJECTIVE_PROGRESS"
		return "OK"
	end

	state.lifecycle = "COMPLETED"
	local reward = self.quest.reward
	if not table.find(state.artifacts, reward.artifactId) then
		state.storySparks += reward.storySparks
		table.insert(state.artifacts, reward.artifactId)
	end
	return "QUEST_COMPLETED"
end

-- Engine-neutral view of the state, compared against the shared test vectors.
function Gate:snapshot(state)
	local completed = {}
	for _, id in self.quest.nodeOrder do
		if state.record.completedSteps[id] then
			table.insert(completed, id)
		end
	end
	return {
		lifecycle = state.lifecycle,
		completed = completed,
		region = state.region,
		storySparks = state.storySparks,
		artifacts = table.clone(state.artifacts),
		attempts = state.attempts,
	}
end

return Gate
