# -*- coding: utf-8 -*-

from google.appengine.ext import webapp
from google.appengine.api import users

from django.utils import simplejson as json

class LoginCheckHandler(webapp.RequestHandler):
  """Lists all texts of type post to display for example on start page"""
  def get(self):
    user = users.get_current_user()
    result = {}
    if user == None:
      result['isLoggedIn'] = False
      result['loginURL'] = users.create_login_url('/')
    else:
      result['isLoggedIn'] = True
    
    self.response.out.write(json.dumps(result))
