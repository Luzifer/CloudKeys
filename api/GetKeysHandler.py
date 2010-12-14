from google.appengine.ext import webapp
from google.appengine.api import users

from django.utils import simplejson as json

from models.StoredKey import StoredKey

class GetKeysHandler(webapp.RequestHandler):
  """Lists all passwords of the current logged in user"""
  def get(self):
    user = users.get_current_user()
    result = {}
    
    if user == None:
      result['status'] = False
    else:
      result['status'] = True
      passwords = StoredKey.all().filter('user = ', user)
      result['passwords'] = []
      for password in passwords:
        result['passwords'].append(password.to_d())
  
    self.response.out.write(json.dumps(result))
