/// <reference types="msfstypes/JS/common" />
import { NavProcSimVarPublisher, NavSourceType } from 'msfssdk/instruments';
/**
 * An instrument that gathers localizer and glideslope information for use by
 * the AP systems.
 */
export class APRadioNavInstrument {
    /**
     * Creates an instance of the APRadioNavInstrument.
     * @param bus The event bus to use with this instance.
     */
    constructor(bus) {
        this.bus = bus;
        this.navRadioData = {
            1: {
                glideslope: this.createEmptyGlideslope({ index: 1, type: NavSourceType.Nav }),
                localizer: this.createEmptyLocalizer({ index: 1, type: NavSourceType.Nav }),
                cdi: this.createEmptyCdi({ index: 1, type: NavSourceType.Nav }),
                obs: this.createEmptyObs({ index: 1, type: NavSourceType.Nav })
            },
            2: {
                glideslope: this.createEmptyGlideslope({ index: 2, type: NavSourceType.Nav }),
                localizer: this.createEmptyLocalizer({ index: 2, type: NavSourceType.Nav }),
                cdi: this.createEmptyCdi({ index: 2, type: NavSourceType.Nav }),
                obs: this.createEmptyObs({ index: 2, type: NavSourceType.Nav })
            }
        };
        this.currentCdiIndex = 1;
        this.navProc = new NavProcSimVarPublisher(bus);
        this.publisher = bus.getPublisher();
    }
    /** @inheritdoc */
    init() {
        this.navProc.subscribe('nav1_glideslope');
        this.navProc.subscribe('nav1_gs_lla');
        this.navProc.subscribe('nav1_gs_error');
        this.navProc.subscribe('nav1_raw_gs');
        this.navProc.subscribe('nav1_localizer');
        this.navProc.subscribe('nav1_localizer_crs');
        this.navProc.subscribe('nav1_cdi');
        this.navProc.subscribe('nav1_obs');
        this.navProc.subscribe('nav2_glideslope');
        this.navProc.subscribe('nav2_gs_lla');
        this.navProc.subscribe('nav2_gs_error');
        this.navProc.subscribe('nav2_raw_gs');
        this.navProc.subscribe('nav2_localizer');
        this.navProc.subscribe('nav2_localizer_crs');
        this.navProc.subscribe('nav2_cdi');
        this.navProc.subscribe('nav2_obs');
        this.navProc.subscribe('nav1_lla');
        this.navProc.subscribe('nav2_lla');
        this.navProc.startPublish();
        const navProcSubscriber = this.bus.getSubscriber();
        navProcSubscriber.on('nav1_glideslope').handle(hasGs => this.setGlideslopeValue(1, 'isValid', hasGs));
        navProcSubscriber.on('nav1_gs_lla').handle(lla => this.sendGlideslopePosition(1, lla));
        navProcSubscriber.on('nav1_gs_error').handle(gsError => this.setGlideslopeValue(1, 'deviation', gsError));
        navProcSubscriber.on('nav1_raw_gs').handle(rawGs => this.setGlideslopeValue(1, 'gsAngle', rawGs));
        navProcSubscriber.on('nav1_localizer').handle(hasLoc => this.setLocalizerValue(1, 'isValid', hasLoc));
        navProcSubscriber.on('nav1_localizer_crs').handle(locCourse => this.setLocalizerValue(1, 'course', locCourse));
        navProcSubscriber.on('nav1_cdi').handle(deviation => this.setCDIValue(1, 'deviation', deviation));
        navProcSubscriber.on('nav1_obs').handle(obs => this.setOBSValue(1, 'heading', obs));
        navProcSubscriber.on('nav2_glideslope').handle(hasGs => this.setGlideslopeValue(2, 'isValid', hasGs));
        navProcSubscriber.on('nav2_gs_lla').handle(lla => this.sendGlideslopePosition(2, lla));
        navProcSubscriber.on('nav2_gs_error').handle(gsError => this.setGlideslopeValue(2, 'deviation', gsError));
        navProcSubscriber.on('nav2_raw_gs').handle(rawGs => this.setGlideslopeValue(2, 'gsAngle', rawGs));
        navProcSubscriber.on('nav2_localizer').handle(hasLoc => this.setLocalizerValue(2, 'isValid', hasLoc));
        navProcSubscriber.on('nav2_localizer_crs').handle(locCourse => this.setLocalizerValue(2, 'course', locCourse));
        navProcSubscriber.on('nav2_cdi').handle(deviation => this.setCDIValue(2, 'deviation', deviation));
        navProcSubscriber.on('nav2_obs').handle(obs => this.setOBSValue(2, 'heading', obs));
        navProcSubscriber.on('nav1_lla').handle(lla => this.sendNavPosition(1, lla));
        navProcSubscriber.on('nav2_lla').handle(lla => this.sendNavPosition(2, lla));
        const navEvents = this.bus.getSubscriber();
        navEvents.on('cdi_select').handle(source => this.currentCdiIndex = source.type === NavSourceType.Nav ? source.index : 0);
    }
    /** @inheritdoc */
    onUpdate() {
        this.navProc.onUpdate();
    }
    /**
     * Sets a value in a nav radio glideslope.
     * @param index The index of the nav radio.
     * @param field The field to set.
     * @param value The value to set the field to.
     */
    setGlideslopeValue(index, field, value) {
        this.navRadioData[index].glideslope[field] = value;
        if (this.currentCdiIndex === index) {
            this.publisher.pub('glideslope', this.navRadioData[index].glideslope);
        }
    }
    /**
     * Sends the current glideslope's LLA position.
     * @param index The index of the nav radio.
     * @param lla The LLA to send.
     */
    sendGlideslopePosition(index, lla) {
        if (this.currentCdiIndex === index) {
            this.publisher.pub('gsLocation', lla);
        }
    }
    /**
     * Sends the current nav's LLA position.
     * @param index The index of the nav radio.
     * @param lla The LLA to send.
     */
    sendNavPosition(index, lla) {
        if (this.currentCdiIndex === index) {
            this.publisher.pub('navLocation', lla);
        }
    }
    /**
     * Sets a value in a nav radio localizer.
     * @param index The index of the nav radio.
     * @param field The field to set.
     * @param value The value to set the field to.
     */
    setLocalizerValue(index, field, value) {
        this.navRadioData[index].localizer[field] = value;
        if (this.currentCdiIndex === index) {
            this.publisher.pub('localizer', this.navRadioData[index].localizer);
        }
        switch (index) {
            case 1:
                this.publisher.pub('nav_1_localizer', this.navRadioData[index].localizer);
                break;
            case 2:
                this.publisher.pub('nav_2_localizer', this.navRadioData[index].localizer);
                break;
        }
    }
    /**
     * Sets a value in a nav radio localizer.
     * @param index The index of the nav radio.
     * @param field The field to set.
     * @param value The value to set the field to.
     */
    setCDIValue(index, field, value) {
        this.navRadioData[index].cdi[field] = value;
        if (this.currentCdiIndex === index) {
            this.publisher.pub('cdi_deviation', this.navRadioData[index].cdi);
        }
        switch (index) {
            case 1:
                this.publisher.pub('nav_1_cdi', this.navRadioData[index].cdi);
                break;
            case 2:
                this.publisher.pub('nav_2_cdi', this.navRadioData[index].cdi);
                break;
        }
    }
    /**
     * Sets a value in a nav radio localizer.
     * @param index The index of the nav radio.
     * @param field The field to set.
     * @param value The value to set the field to.
     */
    setOBSValue(index, field, value) {
        this.navRadioData[index].obs[field] = value;
        if (this.currentCdiIndex === index) {
            this.publisher.pub('obs_setting', this.navRadioData[index].obs);
        }
    }
    /**
     * Creates an empty localizer data.
     * @param id The nav source ID.
     * @returns New empty localizer data.
     */
    createEmptyLocalizer(id) {
        return {
            isValid: false,
            course: 0,
            source: id
        };
    }
    /**
     * Creates an empty glideslope data.
     * @param id The nav source ID.
     * @returns New empty glideslope data.
     */
    createEmptyGlideslope(id) {
        return {
            isValid: false,
            gsAngle: 0,
            deviation: 0,
            source: id
        };
    }
    /**
     * Creates an empty CDI data.
     * @param id The nav source ID.
     * @returns New empty CDI data.
     */
    createEmptyCdi(id) {
        return {
            deviation: 0,
            source: id
        };
    }
    /**
     * Creates an empty OBS data.
     * @param id The nav source ID.
     * @returns New empty OBS data.
     */
    createEmptyObs(id) {
        return {
            heading: 0,
            source: id
        };
    }
}
