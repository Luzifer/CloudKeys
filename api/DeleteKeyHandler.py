from google.appengine.ext import webapp
from google.appengine.api import users

from django.utils import simplejson as json

from models.StoredKey import StoredKey

class DeleteKeyHandler(webapp.RequestHandler):
  """Lists all texts of type post to display for example on start page"""
  def get(self):
    user = users.get_current_user()
    result = {}
    
    if user == None:
      result['status'] = False
    else:
      password = StoredKey.get(Key(self.request.get('key')))
      if password == None:
        result['status'] = False
      else:
        password.delete()
        result['status'] = True
  
    self.response.out.write(json.dumps(result))