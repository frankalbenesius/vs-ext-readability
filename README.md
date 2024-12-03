**To Run**

- pull repository, install dependencies, and open in vs code
- run the `Debug: Start Debugging` command to open the Extension Development Host
- to see code changes, run the `Developer: Reload Window` command in the Host window

---

**Development Notes**

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
- if the view can display "no scores" because of file type or some other reason, find a way to display that state more nicely 

i'm pretty sure i'm forgetting something but i think i'll be able to wrap these items up tomorrow. i'm going to go do other stuff :)

_12/2/24_

The extension's cabilities are now:

- activated by plaintext and markdown files in the editor
- a status bar item displays the current readability metric of the file (or selection)
- an Explorer Readability view displays a simple tree of text selection information and all current metrics for that text
- you can configure which metric is displayed in the status bar
- clicking on the status bar item focuses the view
- clicking on metrics opens the wikipedia entry for that metric

Future considerations:

- what should activate the extension? is file type too narrow of an activation?
- what metrics are most useful to which users? should more or less be available?
- if we were to use a webview instead of a tree view, what other information could we display and would that improve the UX?
- more nuanced metrics about _which_ words or sentences were most complex might be more useful (though the currently used readability library does not offer that functionality directly)
- more nuanced selection may be helpful, like making sure the selection only includes full sentences or words
- possible configurations include: which metrics to display in the view, how often to update metrics, which files  types activate the extension


<img width="976" alt="Screenshot 2024-12-02 at 8 37 07 PM" src="https://github.com/user-attachments/assets/bb547487-4e0a-4a40-ada5-1c4b6ec8724d">


