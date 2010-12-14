from google.appengine.ext import webapp
from google.appengine.api import users

from django.utils import simplejson as json

from models.StoredKey import StoredKey

class SaveKeyHandler(webapp.RequestHandler):
  """Stores a password to the database"""
  def post(self):
    user = users.get_current_user()
    result = {}
    
    if user == None:
      result['status'] = False
    else:
      key = self.request.get('key')
      password = None
      if key == '':
        password = StoredKey(username = '', password = '', title = '')
      else:
        password = StoredKey.get(Key(key))
      
      password.from_request(self.request)
      password.save()
      
      result['status'] = True
  
    self.response.out.write(json.dumps(result))