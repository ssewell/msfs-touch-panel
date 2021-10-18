/// <reference types="msfstypes/JS/simvar" />
import { SimVarValueType } from 'msfssdk/data';
import { SimVarPublisher } from 'msfssdk/instruments';
/** Simvars to publish. */
export var FuelComputerSimVars;
(function (FuelComputerSimVars) {
    FuelComputerSimVars["Remaining"] = "L:WT1000_Fuel_GalRemaining";
    FuelComputerSimVars["Burned"] = "L:WT1000_Fuel_GalBurned";
    FuelComputerSimVars["Endurance"] = "L:WT1000_Fuel_Endurance";
    FuelComputerSimVars["Range"] = "L:WT1000_Fuel_Range";
})(FuelComputerSimVars || (FuelComputerSimVars = {}));
/** A publisher to poll fuel-related simvars. */
class FuelSimVarPublisher extends SimVarPublisher {
    /**
     * Create a FuelSimVarPublisher
     * @param bus The EventBus to publish to
     */
    constructor(bus) {
        super(FuelSimVarPublisher.simvars, bus);
    }
}
FuelSimVarPublisher.simvars = new Map([
    ['fuelQty', { name: 'FUEL TOTAL QUANTITY', type: SimVarValueType.GAL }],
    ['fuelFlow1', { name: 'ENG FUEL FLOW GPH:1', type: SimVarValueType.GPH }],
    ['fuelFlow2', { name: 'ENG FUEL FLOW GPH:2', type: SimVarValueType.GPH }],
]);
/** A simple fuel totalizer and related logic. */
class Totalizer {
    constructor() {
        this._fuelCapacity = 0;
        this._fuelRemaining = 0;
        this._fuelBurned = 0;
        this._rawQty = 0;
        this._priorRawQty = 0;
    }
    /**
     * Set the total fuel capacity, but only once.
     * @param capacity The total capacity.
     */
    setCapacity(capacity) {
        if (this._fuelCapacity == 0) {
            this._fuelCapacity = capacity;
        }
    }
    /**
     * Set the amount of fuel remaining.
     * @param value The amount of fuel remaining.
     */
    set fuelRemaining(value) {
        this._fuelRemaining = value;
        SimVar.SetSimVarValue(FuelComputerSimVars.Remaining, 'gallons', value);
    }
    /**
     * Get the amount of fuel remaining.
     * @returns The amount of fuel remaining.
     */
    get fuelRemaining() {
        return this._fuelRemaining;
    }
    /**
     * Set the amount of fuel burned.
     * @param value The amount of fuel burned.
     */
    set fuelBurned(value) {
        this._fuelBurned = value;
        SimVar.SetSimVarValue(FuelComputerSimVars.Burned, 'gallons', value);
    }
    /**
     * Get the amount of fuel burned.
     * @returns The amount of fuel burned.
     */
    get fuelBurned() {
        return this._fuelBurned;
    }
    /**
     * Set the raw quantity present.
     * @param value The quantity present.
     */
    set rawQty(value) {
        if (value < this._priorRawQty) {
            // We would normally expect the raw quantity to decrease.   If it does,
            // assume we're seeing standard fuel burn and update our totals.  If it
            // goes _up_, we'll treat it as a refuel and not add any burn total and
            // it's up to the user to increase the fuel remaining, just like in
            // real life!
            const burned = this._priorRawQty - value;
            this.fuelBurned += burned;
            this.fuelRemaining -= burned;
        }
        this._priorRawQty = value;
    }
    /**
     * Get the current raw quantity.
     * @returns The current raw quantity.
     */
    get rawQty() {
        return this._rawQty;
    }
    /**
     * Handle an adjustment to the fuel remaining value.
     * @param adjustment The adjustment to make.
     */
    adjust(adjustment) {
        switch (adjustment.direction) {
            case 'add':
                this.fuelRemaining += adjustment.amount;
                break;
            case 'remove':
                this.fuelRemaining -= adjustment.amount;
                break;
            case 'set':
                this.fuelRemaining = adjustment.amount;
                break;
        }
        // Always reset the burn total when there's an adjustment.
        this.fuelBurned = 0;
    }
    /**
     * Reset the fuel totalizer.
     * @param flag If true, reset.   (We need to have real noop events.)
     */
    reset(flag) {
        if (flag) {
            this.fuelRemaining = this._fuelCapacity;
            this.fuelBurned = 0;
        }
    }
}
/**
 * An instrument that tracks fuel state for use by the G1000 systems page.
 */
export class FuelComputer {
    /**
     * Create a fuel computer.
     * @param bus An event bus
     */
    constructor(bus) {
        this.simVarPublisher = new FuelSimVarPublisher(bus);
        this.simVarPublisher.subscribe('fuelQty');
        this.simVarPublisher.subscribe('fuelFlow1');
        this.simVarPublisher.subscribe('fuelFlow2');
        this.simVarSubscriber = bus.getSubscriber();
        this.controlSubscriber = bus.getSubscriber();
        this.totalizer = new Totalizer();
    }
    /** Intialize the instrument. */
    init() {
        this.simVarPublisher.startPublish();
        this.totalizer.setCapacity(SimVar.GetSimVarValue('FUEL TOTAL CAPACITY', 'gallons') - SimVar.GetSimVarValue('UNUSABLE FUEL TOTAL QUANTITY', 'gallons'));
        this.totalizer.fuelRemaining = SimVar.GetSimVarValue('FUEL TOTAL QUANTITY', 'gallons');
        this.simVarSubscriber.on('fuelQty').whenChangedBy(0.1).handle((qty) => { this.totalizer.rawQty = qty; });
        this.controlSubscriber.on('fuel_adjustment').handle((adjustment) => { this.totalizer.adjust(adjustment); });
        this.controlSubscriber.on('fuel_comp_reset').handle((flag) => { this.totalizer.reset(flag); });
    }
    /**
     * Perform events for the update loop.
     */
    onUpdate() {
        this.simVarPublisher.onUpdate();
    }
}
