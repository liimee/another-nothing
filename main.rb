require 'sinatra/base'
require 'sequel'
require 'sqlite3'
require 'bcrypt'

class AnotherNothing < Sinatra::Base
  db = Sequel.sqlite

  db.create_table :users do
    primary_key String :username
    String :password
    String :apps
  end

  db.create_table :config do
    primary_key String :key
    String :value
  end

  $users = db[:users]
  $config = db[:config]

  puts

  $config.insert(:key => :jwt, :value => (0..18).map{Random.rand(1...9)}) unless $config.where(:key => :jwt) != nil

  set :public_folder, 'build'

  get '/' do
    if $users.count < 1
      send_file 'build/adduser.html'
    else
      send_file 'build/index.html'
    end
  end

  post '/addus' do
    if $users.count < 1
      addUser(params)
    end
    redirect '/'
    # TODO: add checks
  end

  def addUser(d)
    $users.insert(:username => d[:name], :password => BCrypt::Password.create(d[:pass]), :apps => "[]")
  end

  run! if app_file == $0
end
