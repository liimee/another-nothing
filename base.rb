require 'sinatra/base'
require 'jwt'
require 'sequel'
require 'sqlite3'

module Sinatra
  module LoginHelper
    def checklogin()
      begin
        db = Sequel.connect 'sqlite://data/data.db'
        s = JWT.decode(request.cookies["login"], "#{db[:config].first(:key => "jwt")}", true, { algorithm: 'HS256' })[0]
        if db[:users].first(:username => s["user"]) == nil
          nil
        else
          s
        end
      rescue => e
        nil
      end
    end
  end

  helpers LoginHelper
end

class AnotherNothingBase < Sinatra::Base
  helpers Sinatra::LoginHelper
end
