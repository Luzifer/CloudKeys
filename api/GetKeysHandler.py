from google.appengine.ext import webapp
from google.appengine.api import users
from google.appengine.api import memcache

from django.utils import simplejson as json

from models.StoredKey import StoredKey

class GetKeysHandler(webapp.RequestHandler):
  """Lists all passwords of the current logged in user"""
  def get(self):
    user = users.get_current_user()
    result = {}
    
    if user == None:
      result['status'] = False
      result['message'] = 'User is not logged in'
    else:
      result['status'] = True
#      unique_id = user.federated_identity()
#      if unique_id is None:
#        unique_id = user.user_id()
      unique_id = str(user)

      data = memcache.get(unique_id)
      if data is None:
        passwords = StoredKey.all().filter('user = ', user)
        result['passwords'] = []
        for password in passwords:
          result['passwords'].append(password.to_d())
        memcache.set(unique_id, json.dumps(result['passwords']))
      else:
        result['passwords'] = json.loads(data)
  
    self.response.out.write(json.dumps(result))
