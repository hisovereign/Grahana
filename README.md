# Eclipsite
Vertical per-app volume control for Linux Cinnamon

-Displays active audio sources in a vertical format with sliders and media information.

## Requirements

-Cinnamon Desktop environment
-PipeWire (for media information)

## Installation

1. Download moonstone and sunstone and place them in ~/.local/bin

2. Download the eclipsite@hisovereign folder and place it in ~/.local/share/cinnamon/applets

3. Restart cinnamon (alt + F2 then type r and hit enter) or restart pc

4. Open applet menu (right-click on panel, click applets) and add the eclipsite applet from manage tab.

## How to use

-click on eclipsite applet icon and active sound sources will come up
-sliders change volume 
-click an app icon to mute/unmute sound

## Known behavior

Muting sound from browser will make it an inactive sound source and it will dissapear form the list. Unmuting brings it back however this breaks current media information and it will show generic browser name. To fix reload page.

Some browsers currently not supports for media information.
