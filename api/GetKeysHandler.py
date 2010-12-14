from google.appengine.ext import webapp

class GetKeysHandler(webapp.RequestHandler):
  """Lists all texts of type post to display for example on start page"""
  def get(self):
