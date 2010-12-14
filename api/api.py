#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

from api.LoginCheckHandler import LoginCheckHandler
from api.GetKeysHandler import GetKeysHandler
from api.SaveKeyHandler import SaveKeyHandler
from api.DeleteKeyHandler import DeleteKeyHandler

def main():
  application = webapp.WSGIApplication([
    # API v1
    ('/api/isLoggedIn', LoginCheckHandler),
    ('/api/getKeys', GetKeysHandler),
    ('/api/saveKey', SaveKeyHandler),
    ('/api/deleteKey', DeleteKeyHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
