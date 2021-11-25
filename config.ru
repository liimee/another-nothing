require_relative 'main.rb'
require 'sequel'
require 'sqlite3'
require 'json'

db = Sequel.connect 'sqlite://data/data.db'
db[:config].insert(:key => "apps", :value => '["Welcome"]') if db[:config].first(:key => "apps") === nil
s = JSON.parse db[:config].first(:key => "apps")[:value]
e = {"/" => AnotherNothing.new}
s.each { |g|
  require_relative "apps/#{g.downcase}/main.rb"
  e['/'+g] = Kernel.const_get(g+'App').new()
}

run Rack::URLMap.new(e)
