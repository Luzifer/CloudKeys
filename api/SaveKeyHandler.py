from google.appengine.ext import webapp
from google.appengine.api import users
from google.appengine.ext.db import Key

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
      if key != None:
        password = StoredKey.get(key)
        if password == None:
          password = StoredKey(username = '', password = '', title = '')
      
        password.from_request(self.request)
        password.save()
      else:
        result['status'] = False
      
      result['status'] = True
  
    self.response.out.write(json.dumps(result))