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
    result['status'] = True
    
    if user == None:
      result['status'] = False
      result['message'] = 'User is not logged in'
    else:
      key = self.request.get('key')
      password = None
      
      if key != None and key != "":
        password = StoredKey.get(key)
      else:
        result['status'] = False
        result['message'] = 'Key was not set or empty'
      
      if result['status'] == True:
        if password == None:
          password = StoredKey(username = ' ', password = ' ', title = ' ')
    
        password.from_request(self.request)
        password.save()
  
    self.response.out.write(json.dumps(result))