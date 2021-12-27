require 'sequel'
require 'sqlite3'
require 'bcrypt'
require 'jwt'
require 'securerandom'
require 'sinatra'
require 'fileutils'
require 'erb'
require 'uri'
require_relative 'rainbows'

set :server, :rainbows

Dir.mkdir 'data' unless File.exist? 'data'
Dir.mkdir 'apps' unless File.exist? 'apps'

db = Sequel.connect 'sqlite://data/data.db'

db.create_table? :users do
  String :username
  String :password
  String :apps
  Boolean :admin
  String :wp, default: 'default'
end

db.create_table? :config do
  String :key
  String :value
end

$users = db[:users]
$config = db[:config]

def checklogin(request)
  begin
    s = JWT.decode(request.cookies["login"], "#{$config.first(:key => "jwt")}", true, { algorithm: 'HS256' })[0]
    if $users.first(:username => s["user"]) == nil
      nil
    else
      s
    end
  rescue => e
    nil
  end
end

$config.insert(:key => "jwt", :value => SecureRandom.hex) if $config.first(:key => "jwt") === nil

before do
  headers \
    "Referrer-Policy" => "origin-when-cross-origin",
    "Cache-Control" => "no-store"
end

get '/' do
  if $users.count < 1
    send_file 'build/adduser.html'
  else
    if checklogin(request) == nil
      send_file 'build/login.html'
    else
      send_file 'build/index.html'
    end
  end
end

post '/upload' do
  e = checklogin(request)
  halt 403, 'you don\'t have permission' if !JSON.parse($users.first(:username => e["user"])[:apps])[/.+\/apps\/(.*)\/build\/.+/.match(request.referrer)[1]]["perms"].include?('upload')
  tempfile = params["e"][:tempfile]
  filename = params["e"][:filename]
  r = Regexp.new(".+\/data\/#{e["user"]}\/.+")
  halt 500, "cannot upload" unless File.absolute_path("data/#{e["user"]}/#{params["path"]||""}/#{filename}").match?(r)
  FileUtils.cp(tempfile.path, "data/#{e["user"]}/#{params["path"]||""}/#{filename}")
  "ok, i guess"
end

$cns = []
get '/things' do
  d = checklogin(request)
  halt 401 unless d != nil
  content_type "text/event-stream"
  stream(:keep_open) do |out|
    $cns.push([
      d["user"],
      out
    ])

    evs('apps', $users.first(:username => d["user"])[:apps], d["user"])
    evs('conf', getconf(d["user"]).to_json, d["user"])
  end
end

get '/files/*' do
  u = checklogin(request)["user"]
  if File.directory?("./data/#{u}/#{params['splat'].first}")
    x = []
    Dir.entries("./data/#{u}/#{params['splat'].first}").each do |e|
      x.push({
        name: e,
        dir: File.directory?("./data/#{u}/#{params['splat'].first}/#{e}")
      }) unless e == '.' || e == '..'
    end
    content_type :json
    {
      files: x
    }.to_json
  else
    send_file "./data/#{u}/#{params['splat'].first}"
  end
end

get '/addus' do
  s = checklogin(request)
  halt 403 if s == nil || !$users.first(:username => s["user"])[:admin]
  send_file "build/adduser.html"
end

post '/addus' do
  s = checklogin(request)
  if $users.count < 1 || s != nil || $users.first(:username => s["user"])[:admin]
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

get '/logout' do
  response.set_cookie("login", :max_age => -1)
  redirect '/'
end

def settings_p(u)
  d = $users.first(:username => u)
  b = binding
  b.local_variable_set(:d, d)
  b.local_variable_set(:perm_list, ['upload'])
  b.local_variable_set(:admin, d[:admin])
  b.local_variable_set(:users, $users)
  [File.read('settings.rhtml'), b]
end

get '/settings' do
  halt 500 if request.env["HTTP_SEC_FETCH_DEST"] == 'iframe'
  u = checklogin(request)
  s = settings_p u["user"]
  "#{ERB.new(s[0]).result(s[1])}"
end

def getconf(u)
  s = $users.first(:username => u)
  {
    wp: s[:wp]
  }
end

post '/settings' do
  #kinda dumb but ok
  s = URI(request.referrer)
  u = checklogin(request)["user"]
  halt 500, 'no.' unless s.path == '/settings' && !request.xhr? && request.env["HTTP_SEC_FETCH_DEST"] != 'iframe'

  if BCrypt::Password.new($users.first(:username => u)[:password]) == params["pass"]
    $users.where(:username => u).update(params.reject{|k| k.start_with?('app_')||k == 'pass'||k == 'users'})
    g = JSON.parse($users.first(:username => u)[:apps])
    params.select {|k| k.start_with? 'app_'}.each do |k, v|
      v.reject! { |e|
        e == 'app'
      }
      g[k.sub('app_', '')]["perms"] = v
      $users.where(:username => u).update(apps: JSON.generate(g))
    end

    temp = $users
    temp.each do |v|
      unless params.select{|k|k=='users'}.has_value?(v[:username])||v[:username]==u
        $users.where(username: v[:username]).delete
        FileUtils.remove_dir("data/#{v[:username]}")
      end
    end

    evs 'conf', getconf(u).to_json, u
  end

  s = settings_p u
  "#{ERB.new(s[0]).result(s[1])}"
end

def addUser(d)
  buildApp("welcome")
  $users.insert(:username => d[:name], :password => BCrypt::Password.create(d[:pass]), :apps => '{"welcome": {"name": "Welcome", "perms": []}}', :admin => d[:admin] != nil)
  Dir.mkdir("data/#{d[:name]}")
end

def installApp(a, d, e)
  s = $users.first(:username => a)[:apps]
  s = JSON.parse s
  s[d] = {
    name: e,
    perms: []
  }

  d = JSON.generate(s)
  $users.where(:username => a).update(apps: d)

  evs('apps', d, a)
end

def evs(a, b, c=nil)
  s = $cns
  s.reject! { |n| n[0] != c } if c != nil
  s.each do |e|
    e[1] << "event: #{a}\n"
    e[1] << "data: #{b}"
    e[1] << "\n\n"
  end
end

def jwt(a)
  p = { user: a, iat: Time.now.to_i }
  JWT.encode(p, "#{$config.first(:key => "jwt")}", 'HS256')
end

#set :port, 3000

get '/install' do
  #use some json file instead for name and stuff?
  s = checklogin(request)
  halt 401 if s == nil

  installApp(s["user"], params[:id], params[:name])
  buildApp(params[:id])
  redirect '/'
end

get '/:a' do
  halt 500 if params[:a].end_with? ".html"
  send_file "build/#{params[:a]}"
end

def buildApp(a)
  cmd = "yarn run parcel build apps/#{a}/index.html --public-url \"/apps/#{a}/build\" --dist-dir apps/#{a}/build"
  system(cmd)
end

get "/apps/:app/*" do
  g = checklogin(request)
  halt 403 if g == nil || !JSON.parse($users.first(:username => g["user"])[:apps]).include?(params[:app])

  k = params[:app]
  if File.exists?("apps/#{k}/#{params["splat"].first}")
    send_file "apps/#{k}/#{params["splat"].first}"
  else
    send_file "apps/#{k}/build/index.html"
  end
end

$users.each {|x|
  s = JSON.parse x[:apps]
  s.each {|k, v|
    buildApp(k)
  }
}
