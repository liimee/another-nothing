require 'sinatra/base'
require 'sequel'
require 'sqlite3'
require 'bcrypt'
require 'jwt'
require 'securerandom'

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

  $config.insert(:key => "jwt", :value => SecureRandom.hex) if $config.first(:key => "jwt") === nil

  set :public_folder, 'build'

  get '/' do
    if $users.count < 1
      send_file 'build/adduser.html'
    else
      begin
        JWT.decode request.cookies["login"], "#{$config.first(:key => "jwt")}", true, { algorithm: 'HS256' }
        send_file 'build/index.html'
      rescue
        "YOU NEED TO LOG IN"
        #TODO
      end
    end
  end

  post '/addus' do
    if $users.count < 1
      addUser(params)
      response.set_cookie :login, :value => jwt(params[:name])
    end
    redirect '/'
    # TODO: add checks
  end

  def addUser(d)
    $users.insert(:username => d[:name], :password => BCrypt::Password.create(d[:pass]), :apps => "[]")
  end

  def jwt(a)
    p = { user: a }
    JWT.encode(p, "#{$config.first(:key => "jwt")}", 'HS256')
  end

  run! if app_file == $0
end
