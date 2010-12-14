#!/usr/bin/env python
# -*- coding: utf-8 -*-

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

from lib import LoginCheckHandler
from lib import GetKeysHandler
from lib import SaveKeyHandler
from lib import DeleteKeyHandler

def main():
  application = webapp.WSGIApplication([
    # API v1
    ('/isLoggedIn', LoginCheckHandler),
    ('/getKeys', GetKeysHandler),
    ('/saveKey', SaveKeyHandler),
    ('/deleteKey', DeleteKeyHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
