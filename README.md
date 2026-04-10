# Eclipsite
Vertical per-app volume control for Linux Cinnamon

-Displays active audio sources in a vertical format with sliders and media titles from individual browser tabs.

## Requirements

-Cinnamon Desktop environment
-PipeWire (for media information)

## Installation

1. Download moonstone and sunstone and place them in ~/.local/bin

   - Make them executable (open up a terminal, paste in command and hit enter)
```
chmod +x ~/.local/bin/moonstone ~/.local/bin/sunstone
```
3. Download the eclipsite@hisovereign folder and place it in ~/.local/share/cinnamon/applets

   -download the metadata.json and the applet.js then create a folder named eclipsite@hisovereign and place it in ~/.local/share/cinnamon/applets (place the files in folder you made)

4. Restart cinnamon (alt + F2 then type r and hit enter) or restart pc

5. Open applet menu (right-click on panel, click applets) and add the eclipsite applet from manage tab.

## How to use

-click on eclipsite applet icon and active sound sources will come up
-sliders change volume 
-click an app icon to mute/unmute sound

## Known behavior

Muting sound from browser will make it an inactive sound source and it will dissapear form the list. Unmuting brings it back however this breaks current media information and it will show generic browser name. To fix reload page.

Some browsers currently not supported for media information.
