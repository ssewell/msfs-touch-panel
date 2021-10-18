/**
 * Timer modes enum.
 */
export var TimerMode;
(function (TimerMode) {
    TimerMode[TimerMode["UP"] = 0] = "UP";
    TimerMode[TimerMode["DOWN"] = 1] = "DOWN";
})(TimerMode || (TimerMode = {}));
/**
 * This is a timer that can count up or down based on the mode.
 */
export class Timer {
    /**
     * Builds an instance of a Timer
     * @param bus is the EventBus
     * @param g1000Publisher is the g1000 event publisher
     * @param onModeChanged is the onModeChanged callback when the timer mode changes
     * @param onValueChanged is the onValuaChanged callback when the timer value changes
     */
    constructor(bus, g1000Publisher, onModeChanged, onValueChanged) {
        this.onModeChanged = onModeChanged;
        this.onValueChanged = onValueChanged;
        this._mode = TimerMode.UP;
        this._timerRunning = false;
        this._worldTime = 0;
        this._timerValue = 0;
        this._startTime = 0;
        this._canReset = false;
        this.g1000Publisher = g1000Publisher;
        const gnss = bus.getSubscriber();
        gnss.on('zulu_time')
            .withPrecision(0)
            .whenChangedBy(1)
            .handle((time) => {
            this._worldTime = time;
            if (this._timerRunning) {
                this.updateTimer();
            }
        });
    }
    /**
     * Get method for timer mode.
     * @returns this._mode value
     */
    get mode() {
        return this._mode;
    }
    /**
     * Get method for timer mode.
     * @param mode new mode value
     */
    set mode(mode) {
        this._mode = mode;
    }
    /**
     * Get method for timer state (running or not true/false).
     * @returns this._timerValue value
     */
    get timerRunning() {
        return this._timerRunning;
    }
    /**
     * Set method for timer state (running or not true/false).
     * @param state the state to set the timer (true = running, false = stopped).
     */
    set timerRunning(state) {
        this._timerRunning = state;
    }
    /**
     * Get the timer value in seconds.
     * @returns this._timerValue value
     */
    get timerValue() {
        return this._timerValue;
    }
    /**
     * Set method for setting whether the timer can be reset.
     * @param state (true = stopped, can be reset, false = has been reset).
     */
    set canReset(state) {
        this._canReset = state;
    }
    /**
     * Set method for setting whether the timer can be reset.
     * @returns this._canReset value
     */
    get canReset() {
        return this._canReset;
    }
    /**
     * Method to update the timer based on mode and current utc time.
     */
    updateTimer() {
        switch (this._mode) {
            case TimerMode.UP:
                this._timerValue++;
                break;
            case TimerMode.DOWN:
                this._timerValue--;
                if (this._timerValue <= 0) {
                    this.mode = TimerMode.UP;
                    this.onModeChanged(this.mode);
                }
                break;
        }
        this.onValueChanged(this._timerValue);
        this.g1000Publisher.publishEvent('timer_value', this._timerValue);
    }
    /**
     * Method to set timer value
     * @param time is the time to set the timer in seconds
     */
    setTimerValue(time) {
        this._timerValue = time;
    }
    /**
     * Method to reset all timer values
     */
    resetTimer() {
        this._timerValue = 0;
        this.canReset = false;
        this.g1000Publisher.publishEvent('timer_value', 0);
    }
    /**
     * Utility method to get H:M:S values from seconds.
     * @param totalSeconds is the value in seconds
     * @returns an object of hours minutes and seconds as numbers
     */
    static SecondsToHMMSS(totalSeconds) {
        const time = {
            hours: Math.floor(totalSeconds / 3600),
            minutesTens: 0,
            minutesOnes: 0,
            secondsTens: 0,
            secondsOnes: 0
        };
        time.minutesTens = Math.floor((totalSeconds - (time.hours * 3600)) / 600);
        time.minutesOnes = Math.floor((totalSeconds - (time.hours * 3600)) / 60) % 10;
        time.secondsTens = Math.floor((totalSeconds - (time.hours * 3600) - (time.minutesTens * 600) - (time.minutesOnes * 60)) / 10);
        time.secondsOnes = Math.floor((totalSeconds - (time.hours * 3600) - (time.minutesTens * 600) - (time.minutesOnes * 60)) % 10);
        return time;
    }
}
