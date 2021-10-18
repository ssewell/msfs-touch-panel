import { Subject } from 'msfssdk';
import { PFDUserSettings, WindOverlaySettingMode } from '../../../PFD/PFDUserSettings';
/** The controller for the Wind Overlay. */
export class WindOptionController {
    /**
     * Creates the Wind Overlay Controller
     * @param bus is the event bus
     * @param store is the WindOptionStore
     */
    constructor(bus, store) {
        this.bus = bus;
        this.store = store;
        const settingManager = PFDUserSettings.getManager(bus);
        settingManager.whenSettingChanged('windOption').handle((opt) => {
            this.store.selectedView.set(opt);
        });
        const adc = this.bus.getSubscriber();
        adc.on('ambient_wind_velocity').withPrecision(1).handle((v) => {
            this.store.lastWindVelocity = v;
            this.store.currentWind.set({ direction: this.store.lastWindDirection, velocity: v });
        });
        adc.on('ambient_wind_direction').withPrecision(1).handle((v) => {
            this.store.lastWindDirection = v;
            this.store.currentWind.set({ direction: v, velocity: this.store.lastWindVelocity });
        });
        adc.on('hdg_deg').withPrecision(1).handle((hdg) => {
            this.store.currentHeading.set(hdg);
        });
        adc.on('ias').withPrecision(0).handle((v) => {
            this.store.lastIas = v;
            this.noWindHandler(undefined, v);
        });
        adc.on('on_ground').handle((v) => {
            this.store.lastOnGround = v;
            this.noWindHandler(v, undefined);
        });
        this.store.noWindData.sub(() => {
            this.updateView();
        });
        this.store.selectedView.sub(() => {
            this.updateView();
        }, true);
    }
    /**
     * The No Wind Handler.
     * @param onGround is whether the plane is on the ground
     * @param ias is the indicated airspeed
     */
    noWindHandler(onGround, ias) {
        onGround = onGround === undefined ? this.store.lastOnGround : onGround;
        ias = ias === undefined ? this.store.lastIas : ias;
        if (onGround && ias < 30) {
            this.store.noWindData.set(true);
        }
        else {
            this.store.noWindData.set(false);
        }
    }
    /** Updates the view. */
    updateView() {
        const view = this.store.selectedView.get();
        const noData = this.store.noWindData.get();
        if (view === WindOverlaySettingMode.Off) {
            this.store.renderOption.set(WindOverlayRenderOption.NONE);
        }
        else if (noData) {
            this.store.renderOption.set(WindOverlayRenderOption.NOWIND);
        }
        else {
            switch (view) {
                case WindOverlaySettingMode.Opt1:
                    this.store.renderOption.set(WindOverlayRenderOption.OPT1);
                    break;
                case WindOverlaySettingMode.Opt2:
                    this.store.renderOption.set(WindOverlayRenderOption.OPT2);
                    break;
                case WindOverlaySettingMode.Opt3:
                    this.store.renderOption.set(WindOverlayRenderOption.OPT3);
                    break;
            }
        }
    }
}
export var WindOverlayRenderOption;
(function (WindOverlayRenderOption) {
    WindOverlayRenderOption[WindOverlayRenderOption["NONE"] = 0] = "NONE";
    WindOverlayRenderOption[WindOverlayRenderOption["OPT1"] = 1] = "OPT1";
    WindOverlayRenderOption[WindOverlayRenderOption["OPT2"] = 2] = "OPT2";
    WindOverlayRenderOption[WindOverlayRenderOption["OPT3"] = 3] = "OPT3";
    WindOverlayRenderOption[WindOverlayRenderOption["NOWIND"] = 4] = "NOWIND";
})(WindOverlayRenderOption || (WindOverlayRenderOption = {}));
/** The data store for Wind Overlay */
export class WindOptionStore {
    constructor() {
        this.selectedView = Subject.create(WindOverlaySettingMode.Off);
        this.currentWind = Subject.create({ direction: 0, velocity: 0 });
        this.currentHeading = Subject.create(0);
        this.noWindData = Subject.create(true);
        this.renderOption = Subject.create(WindOverlayRenderOption.NONE);
        this.lastWindDirection = 0;
        this.lastWindVelocity = 0;
        this.lastIas = 0;
        this.lastOnGround = true;
    }
}
