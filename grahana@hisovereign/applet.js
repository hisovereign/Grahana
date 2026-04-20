const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Tooltips = imports.ui.tooltips;

const HOME = GLib.get_home_dir();
const USER_BIN_DIR = HOME + "/.local/bin";
const STREAMS_SCRIPT = USER_BIN_DIR + "/moonstone";
const SET_VOLUME_SCRIPT = USER_BIN_DIR + "/sunstone";

class GrahanaApplet extends Applet.IconApplet {
    constructor(metadata, orientation, panelHeight, instanceId) {
        super(orientation, panelHeight, instanceId);

        this.set_applet_icon_symbolic_name("audio-card");
        this.set_applet_tooltip("Grahana - Per-app volume control");

        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menuManager.addMenu(this.menu);

        // No polling interval — refresh only when clicked
        this._buildMenu();
    }

    on_applet_clicked() {
        // Refresh streams before opening menu
        this._updateStreams();
        this.menu.toggle();
    }

    on_applet_removed_from_panel() {
        if (this.menu) {
            this.menu.destroy();
        }
    }

    _buildMenu() {
        this.menu.removeAll();
        let header = new PopupMenu.PopupMenuItem("Loading audio streams...");
        header.setSensitive(false);
        this.menu.addMenuItem(header);
    }
    
    _updateStreams() {
        let result = GLib.spawn_command_line_sync(STREAMS_SCRIPT);
        let ok = result[0];
        let stdout = result[1];
        
        if (!ok) return;
        
        let output = stdout.toString();
        let streams = [];
        
        try {
            streams = JSON.parse(output);
        } catch(e) {
            return;
        }
        
        // Save current menu state
        let wasOpen = this.menu.isOpen;
        
        // Rebuild menu
        this.menu.removeAll();
        
        if (streams.length === 0) {
            let emptyItem = new PopupMenu.PopupMenuItem("No active audio streams");
            emptyItem.setSensitive(false);
            this.menu.addMenuItem(emptyItem);
        } else {
            for (let i = 0; i < streams.length; i++) {
                this._addStreamMenuItem(streams[i]);
            }
        }
        
        // Add Sound Settings at the bottom
        let settingsItem = new PopupMenu.PopupMenuItem("Sound Settings");
        settingsItem.connect('activate', () => {
            GLib.spawn_command_line_async("cinnamon-settings sound");
        });
        this.menu.addMenuItem(settingsItem);
        
        // Reopen if it was open
        if (wasOpen) {
            this.menu.open();
        }
    }
    
    _addStreamMenuItem(stream) {
        let item = new PopupMenu.PopupBaseMenuItem({ reactive: false });
        
        let box = new St.BoxLayout({ vertical: false });
        
        let icon = new St.Icon({
            icon_name: this._getIconName(stream.binary, stream.name),
            icon_type: St.IconType.SYMBOLIC,
            icon_size: 16,
            reactive: true
        });
        
        let displayName = stream.name;
        let tooltipText = displayName + " (" + stream.volume + "%)";
        
        let iconTooltip = new Tooltips.Tooltip(icon, tooltipText);
        box.add(icon);
        
        let slider = new PopupMenu.PopupSliderMenuItem(stream.volume / 100);
        
        slider._streamId = stream.id;
        slider._streamName = displayName;
        slider._iconTooltip = iconTooltip;
        slider._icon = icon;
        slider._currentVolume = stream.volume;
        slider._isMuted = false;
        slider._originalIconName = this._getIconName(stream.binary, stream.name);
        
        let sliderTooltip = new Tooltips.Tooltip(slider.actor, tooltipText);
        slider._sliderTooltip = sliderTooltip;
        
        icon.connect('button-press-event', () => {
            if (!slider._isMuted) {
                slider._lastVolume = slider._currentVolume;
                slider._isMuted = true;
                icon.icon_name = "audio-volume-muted-symbolic";
                slider._iconTooltip.set_text(displayName + " (muted)");
                slider._sliderTooltip.set_text(displayName + " (muted)");
                GLib.spawn_command_line_async(SET_VOLUME_SCRIPT + " " + stream.id + " 0");
            } else {
                let newVolume = slider._lastVolume || 50;
                slider._currentVolume = newVolume;
                slider._isMuted = false;
                icon.icon_name = slider._originalIconName;
                slider._iconTooltip.set_text(displayName + " (" + newVolume + "%)");
                slider._sliderTooltip.set_text(displayName + " (" + newVolume + "%)");
                GLib.spawn_command_line_async(SET_VOLUME_SCRIPT + " " + stream.id + " " + newVolume);
            }
            return true;
        });
        
        slider.connect('value-changed', (sliderItem) => {
            let newVolume = Math.round(sliderItem._value * 100);
            sliderItem._currentVolume = newVolume;
            
            if (newVolume > 0 && sliderItem._isMuted) {
                sliderItem._isMuted = false;
                sliderItem._icon.icon_name = sliderItem._originalIconName;
            }
            
            GLib.spawn_command_line_async(SET_VOLUME_SCRIPT + " " + sliderItem._streamId + " " + newVolume);
            
            let newTooltipText = sliderItem._streamName + " (" + newVolume + "%)";
            sliderItem._iconTooltip.set_text(newTooltipText);
            sliderItem._sliderTooltip.set_text(newTooltipText);
        });
        
        box.add(slider.actor);
        item.addActor(box);
        
        this.menu.addMenuItem(item);
    }
    
    _getIconName(binary, name) {
        let iconMap = {
            // Browsers
            "firefox-bin": "firefox",
            "firefox": "firefox",
            "librewolf": "librewolf",
            "librewolf-bin": "librewolf",
            "brave": "brave-browser",
            "brave-browser": "brave-browser",
            "chromium": "chromium",
            "chrome": "google-chrome",
            "google-chrome": "google-chrome",
            // Apps
            "discord": "discord",
            "spotify": "spotify",
            "steam": "steam",
            "cs2": "steam",
            // Games
            "wwm.exe": "applications-games",
            "wine64-preloader": "wine",
            "sd_dummy": "applications-games"
        };
        
        if (iconMap[binary]) {
            return iconMap[binary];
        }
        
        if (name === "Brave" || name === "brave") {
            return "brave-browser";
        }
        if (name === "LibreWolf" || name === "librewolf") {
            return "librewolf";
        }
        
        return "audio-x-generic";
    }
}

function main(metadata, orientation, panelHeight, instanceId) {
    return new GrahanaApplet(metadata, orientation, panelHeight, instanceId);
}
