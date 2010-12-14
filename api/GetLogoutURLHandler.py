# -*- coding: utf-8 -*-

from google.appengine.ext import webapp
from google.appengine.api import users

from django.utils import simplejson as json

class GetLogoutURLHandler(webapp.RequestHandler):
  """Checks wether a user is logged in and returns the logout url if so"""
  def get(self):
    user = users.get_current_user()
    result = {}
    if user == None:
      result['isLoggedIn'] = False
    else:
      result['isLoggedIn'] = True
      result['logoutURL'] = users.create_logout_url('/')
    
    self.response.out.write(json.dumps(result))
