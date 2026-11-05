--!strict
local MapBuilder = require(script.Parent.MapBuilder)
local SessionManager = require(script.Parent.Core.SessionManager)

-- Phoenicia is off unless the place sets this attribute (see phoenicia.project.json).
-- It runs on its own thread so it never depends on the code below.
if game:GetService("Workspace"):GetAttribute("MV_PHOENICIA") == true then
	task.spawn(function()
		require(script.Parent.Phoenicia.Service).start()
	end)
end

MapBuilder.build()
SessionManager.init()
