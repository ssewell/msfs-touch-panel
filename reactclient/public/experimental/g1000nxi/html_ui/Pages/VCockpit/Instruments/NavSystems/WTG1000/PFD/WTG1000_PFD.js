/// <reference types="msfstypes/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="msfstypes/Pages/VCockpit/Core/VCockpit" />
/// <reference types="msfstypes/JS/simvar" />
/// <reference types="msfstypes/JS/NetBingMap" />
import { FSComponent, Wait } from 'msfssdk';
import { SoundPublisher, SoundServer } from 'msfssdk/utils/SoundServer';
import { CompositeLogicXMLHost, EventBus, HEventPublisher, ControlPublisher, SimVarValueType } from 'msfssdk/data';
import { AirspaceSearcher, FacilityLoader, FacilityRespository } from 'msfssdk/navigation';
import { ADCPublisher, NavComInstrument, InstrumentBackplane, AutopilotInstrument, NavProcessor, GNSSPublisher, Clock, XPDRInstrument, TrafficInstrument } from 'msfssdk/instruments';
import { FlightPathCalculator, FlightPlanner } from 'msfssdk/flightplan';
import { TCASOperatingMode } from 'msfssdk/traffic';
import { XMLAnnunciationFactory } from 'msfssdk/components/Annunciatons';
import { XMLWarningFactory } from 'msfssdk/components/Warnings';
import { G1000ControlPublisher } from '../Shared/G1000Events';
import { LNavSimVarPublisher } from '../Shared/Autopilot/LNavSimVars';
import { VNavSimVarPublisher } from '../Shared/Autopilot/VNavSimVars';
import { MapHSIMenu } from '../Shared/UI/Menus/MapHSIMenu';
import { MapHSILayoutMenu } from '../Shared/UI/Menus/MapHSILayoutMenu';
import { MenuSystem } from '../Shared/UI/Menus/MenuSystem';
import { PFDOptMenu } from '../Shared/UI/Menus/PFDOptMenu';
import { SVTMenu } from '../Shared/UI/Menus/SVTMenu';
import { WindMenu } from '../Shared/UI/Menus/WindMenu';
import { ALTUnitsMenu } from '../Shared/UI/Menus/ALTUnitsMenu';
import { RootMenu } from '../Shared/UI/Menus/RootMenu';
import { XPDRMenu } from '../Shared/UI/Menus/XPDRMenu';
import { XPDRCodeMenu } from '../Shared/UI/Menus/XPDRCodeMenu';
import { SoftKeyBar } from '../Shared/UI/SoftKeyBar';
import { AirspeedIndicator } from './Components/FlightInstruments/AirspeedIndicator';
import { HSI } from './Components/HSI/HSI';
import { VerticalDeviation } from './Components/FlightInstruments/VerticalDeviation';
import { MarkerBeacon } from './Components/FlightInstruments/MarkerBeacon';
import { Altimeter } from './Components/FlightInstruments/Altimeter';
import { FlightDirector } from './Components/FlightInstruments/FlightDirector';
import { NavComRadio } from '../Shared/NavCom/NavComRadio';
import { VerticalSpeedIndicator } from './Components/FlightInstruments/VerticalSpeedIndicator';
import { Fma } from './Components/Overlays/Fma/Fma';
import { BottomInfoPanel } from './Components/Overlays/BottomInfoPanel';
import { G1000Config } from '../Shared/NavComConfig';
import { NPConfig } from '../Shared/NavProcessorConfig';
import { Fms } from '../Shared/FlightPlan/Fms';
import { PFDProc } from './Components/UI/Procedure/PFDProc';
import { PFDWptInfo } from './Components/UI/WptInfo/PFDWptInfo';
import { MapInset } from '../PFD/Components/Overlays/MapInset';
import { FPL } from './Components/UI/FPL/FPL';
import { CAS } from './Components/FlightInstruments/CAS';
import { NavIndicatorController } from '../Shared/Navigation/NavIndicatorController';
import { TimerRef } from './Components/UI/TimerRef/TimerRef';
import { Nearest } from './Components/UI/Nearest';
import { ContextMenuDialog } from '../Shared/UI/Dialogs/ContextMenuDialog';
import { PFDSelectApproach } from './Components/UI/Procedure/PFDSelectApproach';
import { PFDDirectTo } from './Components/UI/DirectTo/PFDDirectTo';
import { PFDSetRunway } from './Components/UI/SetRunway/PFDSetRunway';
import { PFDSelectArrival, PFDSelectDeparture } from './Components/UI/Procedure/PFDSelectProcedure';
import { PageMenuDialog } from '../Shared/UI/Dialogs/PageMenuDialog';
import { WaypointIconImageCache } from '../Shared/WaypointIconImageCache';
import { MessageDialog } from '../Shared/UI/Dialogs/MessageDialog';
import { PFDViewService } from './Components/UI/PFDViewService';
import { WarningDisplay } from './Components/Warnings';
import { PFDWptDupDialog } from './Components/UI/WptDup/PFDWptDupDialog';
import { PFDSetup } from './Components/UI/PFDSetup';
import { FlightPlanAsoboSync } from '../Shared/FlightPlanAsoboSync';
import { PFDSelectAirway } from './Components/UI/Airway/PFDSelectAirway';
import { DMEWindow } from './Components/Overlays/DMEWindow';
import { WindOverlay } from './Components/Overlays/Wind/WindOverlay';
import { ADFDME } from './Components/UI/ADF-DME/ADFDME';
import { TrafficAdvisorySystem } from '../Shared/Traffic/TrafficAdvisorySystem';
import { BacklightManager } from '../Shared/Backlight/BacklightManager';
import { G1000SettingSaveManager } from '../Shared/Profiles/G1000SettingSaveManager';
import { PFDHold } from './Components/UI/Hold/PFDHold';
import { PrimaryHorizonDisplay } from './Components/FlightInstruments/PrimaryHorizonDisplay';
import '../Shared/UI/Common/g1k_common.css';
import './WTG1000_PFD.css';
import '../Shared/UI/Common/LatLonDisplay.css';
/**
 * The base G1000 PFD instrument class.
 */
class WTG1000_PFD extends BaseInstrument {
    /**
     * Creates an instance of the WTG1000_PFD.
     */
    constructor() {
        super();
        this.lastCalculate = 0;
        this.airspaceSearcher = new AirspaceSearcher();
        RegisterViewListener('JS_LISTENER_INSTRUMENTS');
        WaypointIconImageCache.init();
        this.bus = new EventBus();
        this.hEventPublisher = new HEventPublisher(this.bus);
        this.adcPublisher = new ADCPublisher(this.bus);
        this.gnssPublisher = new GNSSPublisher(this.bus);
        this.soundPublisher = new SoundPublisher(this.bus);
        this.adcPublisher.subscribe('tas');
        this.adcPublisher.subscribe('ias');
        this.adcPublisher.subscribe('hdg_deg');
        this.adcPublisher.subscribe('hdg_deg_true');
        this.adcPublisher.subscribe('vs');
        this.adcPublisher.subscribe('alt');
        this.adcPublisher.subscribe('pitch_deg');
        this.adcPublisher.subscribe('roll_deg');
        this.adcPublisher.subscribe('kohlsman_setting_hg_1');
        this.adcPublisher.subscribe('kohlsman_setting_mb_1');
        this.adcPublisher.subscribe('turn_coordinator_ball');
        this.adcPublisher.subscribe('delta_heading_rate');
        this.adcPublisher.subscribe('ambient_temp_c');
        this.adcPublisher.subscribe('ambient_wind_velocity');
        this.adcPublisher.subscribe('ambient_wind_direction');
        this.adcPublisher.subscribe('on_ground');
        this.adcPublisher.subscribe('aoa');
        this.lNavPublisher = new LNavSimVarPublisher(this.bus);
        this.lNavPublisher.subscribe('lnavBrgMag');
        this.lNavPublisher.subscribe('lnavDis');
        this.lNavPublisher.subscribe('lnavDisTurn');
        this.lNavPublisher.subscribe('lnavDtkMag');
        this.lNavPublisher.subscribe('lnavNextDtkMag');
        this.lNavPublisher.subscribe('lnavXtk');
        this.lNavPublisher.subscribe('lnavCdiScaling');
        this.lNavPublisher.subscribe('lnavCdiScalingLabel');
        this.lNavPublisher.subscribe('lnavCurrentVector');
        this.vNavPublisher = new VNavSimVarPublisher(this.bus);
        this.vNavPublisher.subscribe('vnavPathMode');
        this.vNavPublisher.subscribe('vnavTodDistance');
        this.vNavPublisher.subscribe('vnavTodLegIndex');
        this.vNavPublisher.subscribe('vnavTodLegDistance');
        this.vNavPublisher.subscribe('vnavBodLegIndex');
        this.vNavPublisher.subscribe('vnavAltCaptureType');
        this.vNavPublisher.subscribe('vnavTargetAlt');
        this.vNavPublisher.subscribe('vnavVDev');
        this.vNavPublisher.subscribe('vnavFpa');
        this.vNavPublisher.subscribe('vnavLpvVDev');
        this.vNavPublisher.subscribe('vnavLpvDistance');
        this.vNavPublisher.subscribe('vnavApproachMode');
        this.vNavPublisher.subscribe('vnavAltCaptureType');
        this.vNavPublisher.subscribe('vnavBodDistance');
        this.vNavPublisher.subscribe('vnavConstraintAltitude');
        this.vNavPublisher.subscribe('vnavConstraintLegIndex');
        this.vNavPublisher.subscribe('vnavRequiredVs');
        this.controlPublisher = new ControlPublisher(this.bus);
        this.g1000ControlPublisher = new G1000ControlPublisher(this.bus);
        this.navComInstrument = new NavComInstrument(this.bus, G1000Config, 2, 2, true);
        this.apInstrument = new AutopilotInstrument(this.bus);
        this.xpdrInstrument = new XPDRInstrument(this.bus);
        this.trafficInstrument = new TrafficInstrument(this.bus, { realTimeUpdateFreq: 2, simTimeUpdateFreq: 1, contactDeprecateTime: 10 });
        this.clock = new Clock(this.bus);
        this.facLoader = new FacilityLoader(FacilityRespository.getRepository(this.bus));
        this.calculator = new FlightPathCalculator(this.facLoader, { defaultClimbRate: 300, defaultSpeed: 85, bankAngle: 17.5 });
        this.planner = FlightPlanner.getPlanner(this.bus, this.calculator);
        this.viewService = new PFDViewService(this.bus);
        this.navProcessor = new NavProcessor(this.bus, new NPConfig(this.bus, this.planner));
        this.backplane = new InstrumentBackplane();
        this.backplane.addPublisher('adc', this.adcPublisher);
        this.backplane.addPublisher('lnav', this.lNavPublisher);
        this.backplane.addPublisher('vnav', this.vNavPublisher);
        this.backplane.addPublisher('hEvents', this.hEventPublisher);
        this.backplane.addPublisher('control', this.controlPublisher);
        this.backplane.addPublisher('g1000', this.g1000ControlPublisher);
        this.backplane.addPublisher('gnss', this.gnssPublisher);
        this.backplane.addPublisher('sound', this.soundPublisher);
        this.backplane.addInstrument('navcom', this.navComInstrument);
        this.backplane.addInstrument('ap', this.apInstrument);
        this.backplane.addInstrument('nav', this.navProcessor);
        this.backplane.addInstrument('xpdr', this.xpdrInstrument);
        this.backplane.addInstrument('traffic', this.trafficInstrument);
        this.tas = new TrafficAdvisorySystem(this.bus, this.trafficInstrument, 30, 2, 1);
        this.fms = new Fms(this.bus, this.planner, this.viewService, this.g1000ControlPublisher);
        FlightPlanAsoboSync.init();
        this.navIndicatorController = new NavIndicatorController(this.bus, this.fms);
        this.xmlLogicHost = new CompositeLogicXMLHost();
        this.annunciationFactory = new XMLAnnunciationFactory(this);
        this.warningFactory = new XMLWarningFactory(this);
        this.soundServer = new SoundServer(this.bus, this.soundPublisher, this);
        this.backlightManager = new BacklightManager('pfd', this.bus);
        // TODO: Support pilot profiles.
        this.settingSaveManager = new G1000SettingSaveManager(this.bus);
        const saveKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}.profile_1`;
        this.settingSaveManager.load(saveKey);
    }
    /**
     * The instrument template ID.
     * @returns The instrument template ID.
     */
    get templateID() {
        return 'WTG1000_PFD';
    }
    /**
     * Whether or not the instrument is interactive (a touchscreen instrument).
     * @returns True
     */
    get isInteractive() {
        return true;
    }
    /**
     * A callback called when the element is attached to the DOM.
     */
    connectedCallback() {
        super.connectedCallback();
        this.backplane.init();
        const menuSystem = new MenuSystem(this.bus, 'AS1000_PFD_SOFTKEYS_');
        // if (alertsPopoutRef.instance !== null) {
        menuSystem.addMenu('root', new RootMenu(menuSystem, this.controlPublisher, this.g1000ControlPublisher, this.bus));
        // }
        menuSystem.addMenu('map-hsi', new MapHSIMenu(menuSystem));
        menuSystem.addMenu('map-hsi-layout', new MapHSILayoutMenu(menuSystem));
        menuSystem.addMenu('pfd-opt', new PFDOptMenu(menuSystem, this.controlPublisher, this.g1000ControlPublisher, this.bus));
        menuSystem.addMenu('svt', new SVTMenu(menuSystem));
        menuSystem.addMenu('wind', new WindMenu(menuSystem));
        menuSystem.addMenu('alt-units', new ALTUnitsMenu(menuSystem));
        menuSystem.addMenu('xpdr', new XPDRMenu(menuSystem, this.controlPublisher, this.g1000ControlPublisher, this.bus));
        menuSystem.addMenu('xpdr-code', new XPDRCodeMenu(menuSystem, this.bus, this.g1000ControlPublisher));
        menuSystem.pushMenu('root');
        FSComponent.render(FSComponent.buildComponent(PrimaryHorizonDisplay, { bus: this.bus }), document.getElementById('HorizonContainer'));
        FSComponent.render(FSComponent.buildComponent(HSI, { bus: this.bus, flightPlanner: this.planner, navIndicatorController: this.navIndicatorController, airspaceSearcher: this.airspaceSearcher, tas: this.tas }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(FlightDirector, { bus: this.bus }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(AirspeedIndicator, { bus: this.bus }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(VerticalSpeedIndicator, { bus: this.bus, navIndicatorController: this.navIndicatorController }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(Altimeter, { bus: this.bus, g1000Publisher: this.g1000ControlPublisher }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(MarkerBeacon, { bus: this.bus }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(DMEWindow, { bus: this.bus, navIndicatorController: this.navIndicatorController }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(VerticalDeviation, { bus: this.bus, navIndicatorController: this.navIndicatorController }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(NavComRadio, { bus: this.bus, title: 'NAV', position: 'left' }), document.querySelector('#NavComBox #Left'));
        FSComponent.render(FSComponent.buildComponent(NavComRadio, { bus: this.bus, title: 'COM', position: 'right' }), document.querySelector('#NavComBox #Right'));
        FSComponent.render(FSComponent.buildComponent(Fma, { bus: this.bus, planner: this.planner, navController: this.navIndicatorController }), document.getElementById('NavComBox'));
        FSComponent.render(FSComponent.buildComponent(BottomInfoPanel, { bus: this.bus, controlPublisher: this.controlPublisher }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(SoftKeyBar, { menuSystem: menuSystem }), document.getElementById('Electricity'));
        FSComponent.render(FSComponent.buildComponent(WindOverlay, { bus: this.bus }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(MapInset, { bus: this.bus, flightPlanner: this.planner, airspaceSearcher: this.airspaceSearcher, tas: this.tas }), document.getElementById('InstrumentsContainer'));
        FSComponent.render(FSComponent.buildComponent(CAS, { bus: this.bus, logicHandler: this.xmlLogicHost, annunciations: this.annunciationFactory.parseConfig(this.xmlConfig) }), document.getElementById('cas'));
        FSComponent.render(FSComponent.buildComponent(WarningDisplay, { bus: this.bus, soundPublisher: this.soundPublisher, logicHandler: this.xmlLogicHost, warnings: this.warningFactory.parseConfig(this.xmlConfig) }), document.getElementById('warnings'));
        this.viewService.registerView('FPL', () => FSComponent.buildComponent(FPL, { viewService: this.viewService, bus: this.bus, fms: this.fms, title: "Flight Plan", showTitle: true }));
        this.viewService.registerView('PROC', () => FSComponent.buildComponent(PFDProc, { viewService: this.viewService, title: "Procedures", showTitle: true, fms: this.fms }));
        this.viewService.registerView('DirectTo', () => FSComponent.buildComponent(PFDDirectTo, { viewService: this.viewService, bus: this.bus, fms: this.fms, title: "Direct To", showTitle: true }));
        this.viewService.registerView('WptInfo', () => FSComponent.buildComponent(PFDWptInfo, { viewService: this.viewService, bus: this.bus, title: "Waypoint Information", showTitle: true }));
        this.viewService.registerView('MessageDialog', () => FSComponent.buildComponent(MessageDialog, { viewService: this.viewService, title: "", showTitle: false }));
        this.viewService.registerView('SetRunway', () => FSComponent.buildComponent(PFDSetRunway, { viewService: this.viewService, title: "Set Runway", showTitle: true }));
        this.viewService.registerView('SelectDeparture', () => FSComponent.buildComponent(PFDSelectDeparture, { viewService: this.viewService, bus: this.bus, fms: this.fms, title: "Select Departure", showTitle: true }));
        this.viewService.registerView('SelectApproach', () => FSComponent.buildComponent(PFDSelectApproach, { viewService: this.viewService, bus: this.bus, fms: this.fms, title: "Select Approach", showTitle: true }));
        this.viewService.registerView('SelectArrival', () => FSComponent.buildComponent(PFDSelectArrival, { viewService: this.viewService, bus: this.bus, fms: this.fms, title: "Select Arrival", showTitle: true }));
        this.viewService.registerView(ContextMenuDialog.name, () => FSComponent.buildComponent(ContextMenuDialog, { viewService: this.viewService, title: "", showTitle: false, upperKnobCanScroll: true }));
        this.viewService.registerView(PageMenuDialog.name, () => FSComponent.buildComponent(PageMenuDialog, { viewService: this.viewService, title: "Page Menu", showTitle: true }));
        this.viewService.registerView(TimerRef.name, () => FSComponent.buildComponent(TimerRef, { viewService: this.viewService, bus: this.bus, fms: this.fms, title: "TimerRef", showTitle: false }));
        this.viewService.registerView(ADFDME.name, () => FSComponent.buildComponent(ADFDME, { viewService: this.viewService, bus: this.bus, title: "ADF/DME TUNING", showTitle: true, navIndicatorController: this.navIndicatorController }));
        this.viewService.registerView(PFDWptDupDialog.name, () => FSComponent.buildComponent(PFDWptDupDialog, { viewService: this.viewService, title: "Duplicate Waypoints", showTitle: true }));
        this.viewService.registerView(Nearest.name, () => FSComponent.buildComponent(Nearest, { viewService: this.viewService, bus: this.bus, fms: this.fms, loader: this.facLoader, publisher: this.controlPublisher, title: "Nearest Airports", showTitle: true }));
        this.viewService.registerView(PFDSetup.name, () => FSComponent.buildComponent(PFDSetup, { viewService: this.viewService, title: "PFD Setup Menu", showTitle: true, bus: this.bus }));
        this.viewService.registerView('SelectAirway', () => FSComponent.buildComponent(PFDSelectAirway, { viewService: this.viewService, title: "Select Airway", showTitle: true, fms: this.fms }));
        this.viewService.registerView('HoldAt', () => FSComponent.buildComponent(PFDHold, { viewService: this.viewService, title: "Hold at", showTitle: true, fms: this.fms, bus: this.bus }));
        this.controlPublisher.publishEvent('init_cdi', true);
        // force enable animations
        document.documentElement.classList.add('animationsEnabled');
    }
    /**
     * A callback called when the instrument is initialized.
     */
    Init() {
        super.Init();
        this.initPrimaryFlightPlan();
        this.clock.init();
        this.tas.setOperatingMode(TCASOperatingMode.TA_RA); // TODO: putting this here until we get user control set up
        this.tas.init();
        this.backlightManager.init();
    }
    /**
     * Initializes the primary flight plan.
     */
    async initPrimaryFlightPlan() {
        // Request a sync from the MFD in case of an instrument reload
        this.fms.flightPlanner.requestSync();
        await Wait.awaitDelay(500);
        // Initialize the primary plan in case one was not synced.
        this.fms.initPrimaryFlightPlan();
    }
    /**
     * Callback called when the flight starts.
     */
    onFlightStart() {
        super.onFlightStart();
        Wait.awaitCondition(() => this.planner.hasFlightPlan(Fms.PRIMARY_PLAN_INDEX), 1000)
            .then(() => FlightPlanAsoboSync.loadFromGame(this.fms));
    }
    /**
     * A callback called when the instrument gets a frame update.
     */
    Update() {
        super.Update();
        this.clock.onUpdate();
        this.backplane.onUpdate();
        const now = Date.now();
        if (now - this.lastCalculate > 3000) {
            if (this.planner.hasFlightPlan(this.planner.activePlanIndex)) {
                this.planner.getActiveFlightPlan().calculate();
            }
            SimVar.SetSimVarValue('K:HEADING_GYRO_SET', SimVarValueType.Number, 0);
            this.lastCalculate = now;
        }
        this.xmlLogicHost.update();
    }
    /**
     * A callback for when sounds are done playing.  This is needed to support the sound server.
     * @param soundEventId The sound that got played.
     */
    onSoundEnd(soundEventId) {
        console.log(`PFD onSoundEnd for ${soundEventId.originalStr}`);
        this.soundServer.onSoundEnd(soundEventId);
    }
    /**
     * A callback called when the instrument received a H event.
     * @param args The H event and associated arguments, if any.
     */
    onInteractionEvent(args) {
        this.hEventPublisher.dispatchHEvent(args[0]);
    }
}
registerInstrument('wtg1000-pfd', WTG1000_PFD);
