import random
import re

class SecurePasswordGenerator():
  def getPassword(self, charcount):
    return self.__generatePassword(charcount)
  
  def __generatePassword(self, charcount):
    password = '' # Password is empty now
    excludechars = [
      'I', 'l', 'O', '0', 'B', '8'
    ]

    while len(password) < charcount:
      chars = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', 
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 
        'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 
        's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
      ]
      char = chars[random.randint(0, len(chars) - 1)]
      if random.randint(1, 2) == 1:
        char = char.upper()
      if char in excludechars:
        continue
      
      lastNchars = 3
      if len(password) < lastNchars:
        lastNchars = len(password)
      if char in password[lastNchars * -1:]:
        continue
      
      password = password + char
    if self.__checkSecurity(password):
      return password
    else: 
      return self.__generatePassword(charcount)
      
  def __has_no_pattern(self, password):
    patternstrings = [
      'abcdefghijklmnopqrstuvwxyz', # Alphabet
      '01234567890', # Numeric increasing
      'qwertzuiopasdfghjklyxcvbnm', # German keyboard layout
      'zyxwvutsrqponmlkjihgfedcba', # Alphabet reversed
      '09876543210', # Numeric decreasing
      'mnbvcxylkjhgfdsapoiuztrewq', # German keyboard layout reversed
      '789_456_123_147_258_369_159_753', # Numpad patterns
    ]

    i = 0 # Set a simple counter
    while i < len(password) - 2:
      lpwd = password.lower()
      part = lpwd[i:i+2] # Extract 3 character parts of the password
      for pstring in patternstrings:
        if part in pstring:
          return False
        if part[::-1] in pstring:
          return False
      i = i + 1

    return True
  
  def __checkSecurity(self, password):
    if re.search('[0-9]', password) == None:
      return False
    if re.search('[a-z]', password) == None:
      return False
    if re.search('[A-Z]', password) == None:
      return False
    if not self.__has_no_pattern(password):
      return False
    return True
