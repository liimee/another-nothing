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
  e['/apps/'+g] = Kernel.const_get(g+'App').new()
  # TODO: don't let unauthorized users access this
}

run Rack::URLMap.new(e)
