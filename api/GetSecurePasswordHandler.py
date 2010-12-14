from google.appengine.ext import webapp

from django.utils import simplejson as json

from SecurePasswordGenerator import SecurePasswordGenerator

class GetSecurePasswordHandler(webapp.RequestHandler):
  """Creates a new secure password"""
  def get(self):
    result = {}
    
    if self.request.get('chars') != '':
      charactercount = int(self.request.get('chars'))
    else:
      charactercount = 20
    generator = SecurePasswordGenerator()
    password = generator.getPassword(charactercount)
    result['password'] = password
    result['status'] = True
  
    self.response.out.write(json.dumps(result))
