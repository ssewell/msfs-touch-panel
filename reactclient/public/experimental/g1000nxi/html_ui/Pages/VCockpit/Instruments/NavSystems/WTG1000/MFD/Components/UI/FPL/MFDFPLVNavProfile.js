import { FSComponent, DisplayComponent, ComputedSubject, UnitType, NumberUnitSubject, Subject, NumberFormatter } from 'msfssdk';
import { DurationDisplay, DurationDisplayDelim, DurationDisplayFormat } from 'msfssdk/components/common';
import { NumberUnitDisplay } from '../../../../Shared/UI/Common/NumberUnitDisplay';
import './MFDFPLVNavProfile.css';
/**
 * A component that displays the active VNAV profile on the MFD flight plan page.
 */
export class MFDFPLVNavProfile extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.waypointSubject = ComputedSubject.create(undefined, this.renderWaypoint.bind(this));
        this.todBodLabel = Subject.create('TOD');
        this.fpaSubject = ComputedSubject.create(undefined, this.renderFpa.bind(this));
        this.targetAltSub = NumberUnitSubject.createFromNumberUnit(UnitType.FOOT.createNumber(0));
        this.todTimeSub = NumberUnitSubject.createFromNumberUnit(UnitType.SECOND.createNumber(0));
        this.vsTargetSub = NumberUnitSubject.createFromNumberUnit(UnitType.FPM.createNumber(0));
        this.vsRequiredSub = NumberUnitSubject.createFromNumberUnit(UnitType.FPM.createNumber(0));
        this.vdevSub = NumberUnitSubject.createFromNumberUnit(UnitType.FOOT.createNumber(0));
        this.currentGroundSpeed = 30;
        this.currentAltitude = 0;
        this.todDistance = -1;
        this.bodDistance = -1;
        this.showPathDetails = false;
    }
    /** @inheritdoc */
    onAfterRender() {
        const vnav = this.props.bus.getSubscriber();
        this.props.bus.getSubscriber().on('ground_speed').withPrecision(1).handle(gs => this.currentGroundSpeed = gs);
        this.props.bus.getSubscriber().on('alt').withPrecision(0).handle(alt => this.currentAltitude = alt);
        vnav.on('vnavFpa').atFrequency(1).handle(fpa => {
            const val = fpa === 0 ? undefined : fpa;
            this.fpaSubject.set(val);
            this.setVsTarget(val);
        });
        vnav.on('vnavConstraintLegIndex').whenChanged().handle(legIndex => {
            let leg;
            try {
                leg = this.props.flightPlanner.getFlightPlan(0).getLeg(legIndex);
            }
            catch ( /* Continue */_a) { /* Continue */ }
            if (leg !== undefined) {
                this.waypointSubject.set(leg.name);
            }
            else {
                this.waypointSubject.set(undefined);
            }
        });
        vnav.on('vnavNextConstraintAltitude').whenChanged().handle(alt => this.targetAltSub.set(alt <= this.currentAltitude && alt > 0 ? alt : NaN));
        vnav.on('vnavRequiredVs').atFrequency(1).handle(reqVs => this.setVsRequired(reqVs));
        vnav.on('vnavTodDistance').atFrequency(1).handle(distance => {
            this.todDistance = distance;
            this.setTodBod();
        });
        vnav.on('vnavBodDistance').atFrequency(1).handle(distance => {
            this.bodDistance = distance;
            this.setTodBod();
        });
        vnav.on('vnavVDev').atFrequency(1).handle(deviation => {
            if (!this.showPathDetails || Math.abs(deviation) > 10000) {
                this.vdevSub.set(NaN);
            }
            else {
                this.vdevSub.set(-deviation);
            }
        });
        this.props.bus.getSubscriber().on('lnavDis').atFrequency(1).handle(dis => {
            if (!isNaN(dis) && dis > 0) {
                this.setVsRequired(dis);
            }
        });
    }
    /**
     * Sets whether to display the path details in the window or blank them.
     */
    setShowPathDetails() {
        const constraintAlt = this.targetAltSub.get().asUnit(UnitType.FOOT);
        let showPathDetails = false;
        if (!isNaN(constraintAlt) && this.currentAltitude > constraintAlt - 100 && this.currentGroundSpeed > 30) {
            if ((this.todDistance > 0 && this.todDistance < 999999 && UnitType.METER.convertTo(this.todDistance, UnitType.NMILE) / (this.currentGroundSpeed / 60) <= 1)
                || (this.bodDistance > 0 && this.todDistance <= 0)) {
                showPathDetails = true;
            }
        }
        this.showPathDetails = showPathDetails;
    }
    /**
     * Sets the TodBod fields.
     */
    setTodBod() {
        let distance = NaN;
        let label = 'TOD';
        this.setShowPathDetails();
        if (this.showPathDetails) {
            if (this.todDistance > 100) {
                label = 'TOD';
                distance = this.todDistance;
            }
            else {
                label = 'BOD';
                distance = this.bodDistance;
            }
        }
        else if (this.todDistance < 999999 && this.todDistance > 0) {
            label = 'TOD';
            distance = this.todDistance;
        }
        this.todBodLabel.set(label);
        this.todTimeSub.set(isNaN(distance) ? distance : UnitType.METER.convertTo(distance, UnitType.NMILE) / this.currentGroundSpeed, UnitType.HOUR);
    }
    /**
     * Renders the waypoint field.
     * @param name The ICAO to render.
     * @returns The rendered field.
     */
    renderWaypoint(name) {
        if (name !== undefined) {
            return name;
        }
        else {
            return '_ _ _ _ _ _ _ _ _ _ _ _';
        }
    }
    /**
     * Sets the current vertical speed target.
     * @param fpa The current flight path angle.
     */
    setVsTarget(fpa) {
        if (fpa === undefined || (this.todDistance <= 0 && this.bodDistance <= 0) || this.currentGroundSpeed < 30) {
            this.vsTargetSub.set(NaN);
        }
        else {
            this.vsTargetSub.set(this.currentGroundSpeed * Math.tan(UnitType.DEGREE.convertTo(-fpa, UnitType.RADIAN)), UnitType.KNOT);
        }
    }
    /**
     * Renders the target FPA field.
     * @param fpa The FPA to render
     * @returns The rendered field.
     */
    renderFpa(fpa) {
        if (fpa !== undefined) {
            return `-${fpa.toFixed(1)}°`;
        }
        else {
            return '_ _ _ _°';
        }
    }
    /**
     * Sets the current required vertical speed.
     * @param vs is the vs required value in fpm.
     */
    setVsRequired(vs) {
        if (vs < 0 && this.showPathDetails) {
            this.vsRequiredSub.set(vs, UnitType.FPM);
        }
        else {
            this.vsRequiredSub.set(NaN);
        }
    }
    /**
     * Renders the component.
     * @returns The rendered VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", null,
            FSComponent.buildComponent("div", { class: "mfd-fpl-vnav row-1" },
                FSComponent.buildComponent("div", { class: 'mfd-fpl-vnav-wpt' },
                    FSComponent.buildComponent("label", null, "WPT"),
                    FSComponent.buildComponent("span", null, this.waypointSubject)),
                FSComponent.buildComponent(NumberUnitDisplay, { value: this.targetAltSub, displayUnit: Subject.create(UnitType.FOOT), formatter: NumberFormatter.create({ precision: 1, nanString: '_ _ _ _ _' }), class: 'mfd-fpl-vnav-tgtalt' }),
                FSComponent.buildComponent("div", { class: 'mfd-fpl-vnav-tod' },
                    FSComponent.buildComponent("label", null, this.todBodLabel),
                    FSComponent.buildComponent(DurationDisplay, { value: this.todTimeSub, options: { format: DurationDisplayFormat.hh_mm_or_mm_ss, delim: DurationDisplayDelim.ColonOrCross, nanString: '_ _ : _ _' }, class: 'mfd-fpl-vnav-value' }))),
            FSComponent.buildComponent("div", { class: "mfd-fpl-vnav row-2" },
                FSComponent.buildComponent("div", { class: 'mfd-fpl-vnav-tgtvs' },
                    FSComponent.buildComponent("label", null, "VS TGT"),
                    FSComponent.buildComponent(NumberUnitDisplay, { value: this.vsTargetSub, displayUnit: Subject.create(UnitType.FPM), formatter: NumberFormatter.create({ precision: 1, nanString: '_ _ _ _ _' }), class: 'mfd-fpl-vnav-value supplied-value' })),
                FSComponent.buildComponent("div", { class: 'mfd-fpl-vnav-fpa' },
                    FSComponent.buildComponent("label", null, "FPA"),
                    FSComponent.buildComponent("span", { class: 'supplied-value' }, this.fpaSubject))),
            FSComponent.buildComponent("div", { class: "mfd-fpl-vnav row-3" },
                FSComponent.buildComponent("div", { class: 'mfd-fpl-vnav-vsreq' },
                    FSComponent.buildComponent("label", null, "VS REQ"),
                    FSComponent.buildComponent(NumberUnitDisplay, { value: this.vsRequiredSub, displayUnit: Subject.create(UnitType.FPM), formatter: NumberFormatter.create({ precision: 1, nanString: '_ _ _ _ _' }), class: 'mfd-fpl-vnav-value' })),
                FSComponent.buildComponent("div", { class: 'mfd-fpl-vnav-vdev' },
                    FSComponent.buildComponent("label", null, "V DEV"),
                    FSComponent.buildComponent(NumberUnitDisplay, { value: this.vdevSub, displayUnit: Subject.create(UnitType.FOOT), formatter: NumberFormatter.create({ precision: 1, nanString: '_ _ _ _ _' }), class: 'mfd-fpl-vnav-value' })))));
    }
}
