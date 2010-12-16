from google.appengine.ext import webapp
from google.appengine.api import users
from google.appengine.api import memcache
from django.utils import simplejson as json

from models.StoredKey import StoredKey

class DeleteKeyHandler(webapp.RequestHandler):
  """Lists all texts of type post to display for example on start page"""
  def get(self):
    user = users.get_current_user()
    result = {}
    
    if user == None:
      result['status'] = False
      result['message'] = 'User is not logged in'
    else:
      key = self.request.get('key')
      if key != "" and key != None:
        password = StoredKey.get(key)
        if password == None:
          result['status'] = False
          result['message'] = 'Key could not retrieved from database'
        else:
          password.delete()
          result['status'] = True
      else:
        result['status'] = False
        result['message'] = 'Key was empty or not set'
      memcache.delete(str(user))
  
    self.response.out.write(json.dumps(result))
