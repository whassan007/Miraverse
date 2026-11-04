--!strict
local MapBuilder = require(script.Parent.MapBuilder)
local SessionManager = require(script.Parent.Core.SessionManager)

MapBuilder.build()
SessionManager.init()
