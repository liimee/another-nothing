require_relative 'main.rb'
require_relative 'apps/welcome/main.rb'

e = {"/" => AnotherNothing.new, "/api" => WelcomeApp.new}

run Rack::URLMap.new(e)
