# BIG 2 Project

## Login session
- NEVER store any runtime data in local cache, except the logged-in email address
- Once logged in, retrieve the setting from firebase and default in main screen, alongside the score; if none retrieved just default
- After clicking start game button, save the settings into firebase
- After every game finished, save the record into firebase
- During development, everytime adding any new attributes to be stored in firebase, update the firebase rule automatically