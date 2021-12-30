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
def dirg(a) Regexp.new("#{File.absolute_path('.')}\/data\/#{a}\/.+") end

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
  params["e"].each do |f|
    tempfile = f[:tempfile]
    filename = f[:filename]
    halt 500, "cannot upload" unless File.absolute_path("data/#{e["user"]}/#{params["path"]||""}/#{filename}").match?(dirg(e["user"]))
    FileUtils.cp(tempfile.path, "data/#{e["user"]}/#{params["path"]||""}/#{filename}")
  end
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

delete '/files/*' do
  u = checklogin(request)["user"]
  halt 403, 'you don\'t have permission' if !JSON.parse($users.first(:username => u)[:apps])[/.+\/apps\/(.*)\/build\/.+/.match(request.referrer)[1]]["perms"].include?('upload')
  halt 500 unless File.absolute_path("data/#{u}/#{params['splat'].first}").match?(dirg(u))
  #handle errors?
  if File.directory?("data/#{u}/#{params['splat'].first}")
    FileUtils.remove_dir("data/#{u}/#{params['splat'].first}")
  else
    File.delete("data/#{u}/#{params['splat'].first}")
  end

  "OK"
end

post "/copy/*" do
  u = checklogin(request)["user"]
  halt 403, 'you don\'t have permission' if !JSON.parse($users.first(:username => u)[:apps])[/.+\/apps\/(.*)\/build\/.+/.match(request.referrer)[1]]["perms"].include?('upload')
  halt 500 unless File.absolute_path("data/#{u}/#{params['splat'].first}").match?(dirg(u)) && File.absolute_path("data/#{u}/#{params[:to]}").match?(dirg(u))
  FileUtils.cp_r("data/#{u}/#{params['splat'].first}", "data/#{u}/#{params[:to]}")
  "OK"
end

post "/move/*" do
  u = checklogin(request)["user"]
  halt 403, 'you don\'t have permission' if !JSON.parse($users.first(:username => u)[:apps])[/.+\/apps\/(.*)\/build\/.+/.match(request.referrer)[1]]["perms"].include?('upload')
  halt 500 unless File.absolute_path("data/#{u}/#{params['splat'].first}").match?(dirg(u)) && File.absolute_path("data/#{u}/#{params[:to]}").match?(dirg(u))
  FileUtils.mv("data/#{u}/#{params['splat'].first}", "data/#{u}/#{params[:to]}")
  "OK"
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

post '/dir' do
  e = checklogin(request)
  halt 403, 'you don\'t have permission' if !JSON.parse($users.first(:username => e["user"])[:apps])[/.+\/apps\/(.*)\/build\/.+/.match(request.referrer)[1]]["perms"].include?('upload')
  halt 500, 'no.' unless File.absolute_path("data/#{e["user"]}/#{params[:p]}").match?(dirg(e["user"]))
  Dir.mkdir("data/#{e["user"]}/#{params[:p]}")
  "ok"
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
    $users.where(:username => u).update(params.reject{|k| k.start_with?('app_')||k == 'pass'||k == 'users'||k.start_with?('uninstall_')})
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
      unless ((params.select{|k|k=='users'}['users'])||[]).include?(v[:username])||v[:username]==u
        JSON.parse(v[:apps]).each do |k,v|
          FileUtils.remove_dir("apps/#{k}") unless k == 'welcome'||k=='test'||k=='files'
        end
        $users.where(username: v[:username]).delete
        FileUtils.remove_dir("data/#{v[:username]}")
      end
    end

    tpa = JSON.parse($users.first(username: u)[:apps])
    params.select{|k| k.start_with?('uninstall_')}.each do |k,_|
      tpa.delete(k.sub('uninstall_', ''))
      FileUtils.remove_dir('apps/'+k.sub('uninstall_', ''))
    end
    $users.where(:username => u).update(apps: JSON.generate(tpa))

    evs 'conf', getconf(u).to_json, u
    evs 'apps', tpa.to_json, u
  end

  s = settings_p u
  "#{ERB.new(s[0]).result(s[1])}"
end

def addUser(d)
  buildApp("welcome")
  buildApp("test")
  buildApp("files")
  $users.insert(:username => d[:name], :password => BCrypt::Password.create(d[:pass]), :apps => '{"files": {"name": "Files", "perms": ["upload"]}, "test": {"name": "Test", "perms": []}, "welcome": {"name": "Welcome", "perms": []}}', :admin => d[:admin] != nil)
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

post '/install' do
  #use some json file instead for name and stuff?
  halt 500, 'no.' unless URI(request.referrer).path == '/settings' && !request.xhr? && request.env["HTTP_SEC_FETCH_DEST"] != 'iframe'
  s = checklogin(request)
  halt 401, 'authentication failed' if s == nil || BCrypt::Password.new($users.first(:username => s["user"])[:password]) != params["pass"]

  halt 500, 'no.' unless File.absolute_path("data/#{s["user"]}/#{params[:path]}").match?(dirg(s["user"])) && File.directory?("data/#{s["user"]}/#{params[:path]}")
  u = SecureRandom.hex()
  FileUtils.cp_r("data/#{s["user"]}/#{params[:path]}", "apps/#{s["user"]}_#{u}")
  if File.file?("apps/#{s["user"]}_#{u}/package.json")
    system("cd apps/#{s["user"]}_#{u} && yarn")
  end
  installApp(s["user"], "#{s["user"]}_#{u}", params[:name])
  buildApp("#{s["user"]}_#{u}")
  redirect '/settings'
end

get '/:a' do
  halt 500 if params[:a].end_with? ".html"
  send_file "build/#{params[:a]}"
end

def buildApp(a)
  cmd = "yarn run parcel build apps/#{a}/*.html --public-url \"/apps/#{a}/build\" --dist-dir apps/#{a}/build"
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
