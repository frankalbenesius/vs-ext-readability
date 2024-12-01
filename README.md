**notes**

_11/28/24_

1. It looks like the various readability scores are different in their purposes. Some seem to show how "easy" text is to read. While others seem to show what grade of reading level the text represents. Those might have different purposes for different people that might influence the UX.
   1. Should do a little research to see who uses these scores and how.
2. I think it would be good for me to read a bit about VS code extensions each day for a few days before I start coding in order to acclimate myself.
   1. I am curious about things like: what are the available UI elements I can interact with in VS code and how? How do I read from a file, or from a selection? How do I install local extensions vs the marketplace?

---

_11/29/24_

some notes from reading extensions documentation & examples:
![PXL_20241129_201403613 MP](https://github.com/user-attachments/assets/1efe3b39-ff10-4953-9acc-edacd2a56624)

---

_11/30/24_

Used the [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension) tutorial to make a hello world notification and understand the dev environment.

---

_12/1/24_

figured out:

- reading document and/or selection text and getting readability scores
- rendering a status bar item with readability data
  - keeps status bar updated as editor is updated
  - clickable to run a score command
- decided to show the aggregate readability estimate in the status bar icon, with tooltip guidance to click for more info
- decided to use a view in the explorer view container, since "readability" is similar to other views in this view container in that it displays information about the editor content
- starting going down the path of making a web view, but it seems like it might be overkill and unnecessary

todo:

- create a tree view that shows score name, url (for wikipedia context), and scored value
- figure out a way to show when the view's scores are based on entire file vs selection
- figure out best time to update the readability view's content
  - i could make a "refresh" view action to update the information, but it seems like the scores are performant enough that i could keep refreshing the view content similar to the status bar item content
- add some kind of settings?
  - could make this a view action to go to settings, cog wheel icon
  - settings could maybe control which files types to make the extension/command available in, but maybe it's better just to trust the user to use it where they need it and not limit it

i'm pretty sure i'm forgetting something but i think i'll be able to wrap these items up tomorrow
- if the view can display "no scores" because of file type or some other reason, find a way to display that state more nicely 
