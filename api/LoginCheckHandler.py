from google.appengine.ext import webapp

class LoginCheckHandler(webapp.RequestHandler):
  """Lists all texts of type post to display for example on start page"""
  def get(self):
    