# -*- coding: utf-8 -*-

from google.appengine.ext import webapp
from google.appengine.api import users

from django.utils import simplejson as json

class LoginCheckHandler(webapp.RequestHandler):
  """Checks wether a user is logged in and returns the login url if not"""
  def get(self):
    user = users.get_current_user()
    result = {}
    if user == None:
      result['isLoggedIn'] = False
      result['status'] = True
      result['loginURL'] = users.create_login_url('/')
    else:
      result['logoutURL'] = users.create_logout_url('/')
      result['isLoggedIn'] = True
      result['status'] = True
    
    self.response.out.write(json.dumps(result))
