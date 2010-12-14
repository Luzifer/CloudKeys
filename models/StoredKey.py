# -*- coding: utf-8 -*-

from google.appengine.ext import db

class StoredKey(db.Model):
  title = db.StringProperty(required=True, verbose_name="Title")
  password = db.StringProperty(required=True, verbose_name="Password")
  username = db.StringProperty(required=True, verbose_name="Username")
  url = db.StringProperty(required=False, verbose_name="URL")
  note = db.TextProperty(verbose_name="Note")
  lastChange = db.DateTimeProperty(verbose_name="Last Change", auto_now=True)
  user = db.UserProperty(verbose_name="Owner", auto_current_user_add=True)
  category = db.StringProperty(required=False, verbose_name="Category")
  
  def to_d(self):
    result = {}
    result['title'] = self.title
    result['password'] = self.password
    result['username'] = self.username
    result['url'] = self.url
    result['note'] = self.note
    result['category'] = self.category
    result['key'] = str(self.key())
    return result
    
  def from_request(self, request):
    self.title = request.get('title')
    self.password = request.get('password')
    self.username = request.get('username')
    self.url = request.get('url')
    self.note = request.get('note')
    self.category = request.get('category')
    