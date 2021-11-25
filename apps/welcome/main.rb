require_relative '../../base'

class WelcomeApp < AnotherNothingBase
  get '/' do
    "boop"
  end
end
