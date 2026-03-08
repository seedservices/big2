# BIG 2 Project

## DEV Rules
- Do work only according to the ask
- Prevent changing code which is not related to the ask

## Login session
- NEVER store any runtime data in local cache, except the logged-in email address
- Once logged in, retrieve the setting from firebase and default in main screen, alongside the score; if none retrieved just default
- After clicking start game button, save the settings into firebase
- After every game finished, save the record into firebase
- During development, everytime adding any new attributes to be stored in firebase, update the firebase rule automatically

## Screen General
- Prevent scrollbar whenever possible
- Maintain landscape mode and portrait mode separately, and make sure both works

## Ad
- On game screen only, clicking the "start new game" button should open Smart Link in a new page; do not trigger ad from other buttons/screens.
- Social Bar script is: <script src="https://pl28802960.effectivegatecpm.com/46/03/bd/4603bdb57a28ceb1d4305aeb32284928.js"></script>
- Smart Link is: https://www.effectivegatecpm.com/wbwmxkctg?key=e0907e00577f5c2a3eccf85c395c4b6a

## Encoding Rule
- Always save and edit source files in UTF-8.
- Never write files in UTF-16, UTF-32, or ANSI/legacy encodings.
- Preserve existing UTF-8 (with/without BOM) unless explicitly requested to change.

## GitHub Push Rule (except when GitHub is seedservices)
- By default, push means push to staging branch
- Do not push to origin branch unless specify

## Callout Generation Rule
- We might have emoji in the callout text, but do not include the emoji in the mp3 generation
