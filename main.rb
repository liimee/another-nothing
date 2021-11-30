require 'sequel'
require 'sqlite3'
require 'bcrypt'
require 'jwt'
require 'securerandom'
require 'faye'

require './base'
require './apps/welcome/main.rb'

class AnotherNothing < AnotherNothingBase
  Dir.mkdir 'data' unless File.exist? 'data'
  Dir.mkdir 'apps' unless File.exist? 'apps'

  db = Sequel.connect 'sqlite://data/data.db'

  db.create_table? :users do
    primary_key String :username
    String :password
    String :apps
  end

  db.create_table? :config do
    primary_key String :key
    String :value
  end

  $users = db[:users]
  $config = db[:config]

  $config.insert(:key => "jwt", :value => SecureRandom.hex) if $config.first(:key => "jwt") === nil

  set :public_folder, 'build'

  get '/' do
    if $users.count < 1
      send_file 'build/adduser.html'
    else
      if checklogin == nil
        send_file 'build/login.html'
      else
        send_file 'build/index.html'
      end
    end
  end

  post '/addus' do
    if $users.count < 1
      addUser(params)
      response.set_cookie :login, :value => jwt(params[:name])
    end
    redirect '/'
    # TODO: add checks?
  end

  post '/login' do
    redirect back unless $users.first(:username => params[:name]) != nil
    x = BCrypt::Password.new($users.first(:username => params[:name])[:password])
    response.set_cookie :login, :value => jwt(params[:name]) if x == params[:pass]
    redirect '/'
  end

  get '/apps' do
    d = checklogin()
    halt 401 unless d != nil
    $users.first(:username => d["user"])[:apps]
  end

  def addUser(d)
    $users.insert(:username => d[:name], :password => BCrypt::Password.create(d[:pass]), :apps => '{"welcome": {"name": "Welcome"}}')
    Dir.mkdir("data/#{d[:name]}")
  end

  def jwt(a)
    p = { user: a, iat: Time.now.to_i }
    JWT.encode(p, "#{$config.first(:key => "jwt")}", 'HS256')
  end

  set :port, 3000
end

# html files on build/ can be accesseddddddddddddddddddddd
