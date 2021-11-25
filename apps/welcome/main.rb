require_relative '../../base'

class WelcomeApp < AnotherNothingBase
  get '/' do
    send_file "apps/welcome/test.html"
  end
end
