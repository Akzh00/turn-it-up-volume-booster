# Turn It Up: Tab Volume Booster

A small Chrome and Edge extension that makes one browser tab quieter or louder, from 0% up to 200%. Made for that one video that's too quiet even with everything turned up. Your computer's volume and your other tabs stay as they are.

![Turn It Up popup at 150%](docs/screenshots/popup.png)

## Install
**First, what your browser will tell you:** when you install, Chrome and Edge list this extension as able to "read and change all your data on all websites". That's the browser's standard wording for the one permission the boost needs (it lets the extension hear a tab's sound so it can make it louder). The extension only uses it for sound, only on a tab where you moved the slider, and nothing leaves your computer. It has no code that connects to the internet, and you can check: the whole extension is a few small files in the `extension` folder.

Needs Chrome or Edge **version 116 or newer** (any browser updated in the last couple of years).

Turn It Up isn't in the Chrome Web Store. You install it by hand, which takes about a minute:

1. **Download** `turn-it-up-volume-booster-v1.0.0.zip` from the [latest release](https://github.com/Akzh00/turn-it-up-volume-booster/releases/latest) (under **Assets**). The numbers are the version; a newer release has higher numbers.
2. **Unzip it:** right-click the zip → **Extract All** → **Extract** (on a Mac, double-click it). You now have a folder called `turn-it-up-volume-booster-v1.0.0`.
3. **Move that folder somewhere permanent**, for example your Documents folder. The browser runs the extension from it, so if you delete it later, the extension stops working.
4. Open the extensions page and turn on **Developer mode**:
   - **Chrome:** type `chrome://extensions` in the address bar. The switch is at the top right.
   - **Edge:** type `edge://extensions` in the address bar. The switch is on the left.
5. Click **Load unpacked**, open the `turn-it-up-volume-booster-v1.0.0` folder and click **Select Folder**. You'll only see an `icons` folder inside; that's normal, don't open it.
6. Click the puzzle-piece icon in the toolbar and click the pin next to **Turn It Up**, so its speaker icon stays in the toolbar.

## How to use it
1. Go to the tab that's too quiet (or too loud) and click the **speaker icon**.
2. Drag the **slider**: left is quieter (0% is silent), right is louder (up to 200%). The line in the middle is normal volume, 100%.
3. While a tab is above 100%, the popup says **Boosted**. Whenever a tab isn't at 100%, the speaker icon shows its volume (for example **150**, or **50**) on that tab.
4. **Reset to 100%** puts the tab back to normal volume.

The setting is for that one tab. It stays when the page reloads or you click to another video in the same tab, and ends when you close the tab. New tabs start at 100%.

## Good to know
- **"Sharing this tab" icon:** once you move the slider, the browser shows a small capture icon on that tab. That's how the extension gets the tab's sound to make it louder. Nothing leaves your computer. The icon stays until you close the tab, even after **Reset to 100%**.
- **A tiny hiccup, once:** the first time you move the slider on a tab, the sound skips for about a tenth of a second while it switches to the extension. After that, moving the slider or pressing Reset is smooth. (Reset sets the volume back to 100% but keeps the sound running through the extension, which is why it doesn't skip.)
- **No crackling:** above 100%, the loudest moments are gently turned down instead of distorting. So 200% sounds clean, though very loud videos won't get much louder than they already are.
- **Some pages can't be changed:** the browser doesn't let extensions capture its own pages (settings, new tab, the Chrome Web Store). The popup then says "Can't change the volume on this page."
- **Privacy:** the extension collects no data. The volume of each tab is kept only in your browser and forgotten when the tab closes. The browser lists the extension as able to "read and change all your data on all websites". That's the standard wording for the tab-capture permission the boost needs; the extension only uses it for sound, and only on a tab where you moved the slider.

## Update or remove
- **Update:** Turn It Up doesn't update itself. When a new version is out, download its zip, remove the old Turn It Up on the extensions page, and load the new folder the same way as above.
- **Remove:** open the extensions page and click **Remove** under Turn It Up. You can then delete its folder.

## Version
1.0.0. Made by Akzh00. No third-party art, fonts or sounds.

Something not working? [Report a problem](https://github.com/Akzh00/turn-it-up-volume-booster/issues) and say which browser and which website.
