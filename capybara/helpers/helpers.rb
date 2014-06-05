#class Capybara::Session
#  def wait_until(timeout = Capybara.default_wait_time)
#    Timeout.timeout(timeout) do
#      sleep(0.1) until value = yield
#      value
#    end
#  end
#end



# loads all helpers
# convention is one function, one file, same name
# 
require_relative './server_login.rb'
require_relative './ensure_on.rb'
require_relative './current_path_info.rb'
#require_relative './wait_for_ajax.rb'
#require_relative './wait_for_dom.rb'