import { NumberUnitSubject, Subject, UnitType } from 'msfssdk';
/**
 * A store for the Hold page data.
 */
export class HoldStore {
    constructor() {
        /** The indexes for the hold. */
        this.indexes = Subject.create({ segmentIndex: 0, legIndex: 0 });
        /** The course for the hold. */
        this.course = Subject.create(0);
        /** Whether or not the course is inbound or outbound. */
        this.isInbound = Subject.create(0);
        /** Whether or not the hold is based on time or distance. */
        this.isTime = Subject.create(0);
        /** The time that the hold legs should be. */
        this.time = NumberUnitSubject.createFromNumberUnit(UnitType.SECOND.createNumber(60));
        /** The distance of the hold legs. */
        this.distance = NumberUnitSubject.createFromNumberUnit(UnitType.NMILE.createNumber(4));
        /** The direction of the hold. */
        this.turnDirection = Subject.create(0);
        /** The current leg waypoint. */
        this.waypoint = Subject.create(null);
        this.fixIcao = Subject.create('');
    }
}
