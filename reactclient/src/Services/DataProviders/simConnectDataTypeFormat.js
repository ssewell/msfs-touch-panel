export const simConnectDataTypeFormat = {
    PLANE_HEADING: 'toFixed0',
    PLANE_HEADING_TRUE: 'toFixed0',
    PLANE_ALTITUDE: 'toFixed0',
    PLANE_ALTITUDE_ABOVE_GROUND: 'toFixed0',
    PLANE_AIRSPEED: 'toFixed0',
    PLANE_VERTICAL_SPEED: 'toFixed0',

    FLAPS_HANDLE_INDEX: 'toFixed0',
    FLAPS_HANDLE_PERCENT: 'toFixed2',
    FLAPS_ANGLE: 'toFixed0',

    GEAR_CENTER_POSITION:'toFixed0',
    GEAR_LEFT_POSITION:'toFixed0',
    GEAR_RIGHT_POSITION:'toFixed0',

    ELEVATOR_TRIM_PERCENT: 'toFixed1',
    AILERON_TRIM_ANGLE: 'toFixed2',
    ENG_THROTTLE_PERCENT: 'toFixed0',
    ENG_MIXTURE_PERCENT: 'toFixed0',
    ENG_PROP_RPM: 'toFixed0',

    AUTOPILOT_ALTITUDE: 'toFixed0',
    AUTOPILOT_HEADING: 'toFixed0',
    AUTOPILOT_VS: 'toFixed0',
    AUTOPILOT_FLC: 'toFixed0',

    NAV1_ACTIVE_FREQUENCY: 'toFixed2',
    NAV1_STANDBY_FREQUENCY: 'toFixed2',
    NAV2_ACTIVE_FREQUENCY: 'toFixed2',
    NAV2_STANDBY_FREQUENCY: 'toFixed2',

    ADF1_ACTIVE_FREQUENCY: 'decToHex',
    ADF1_STANDBY_FREQUENCY: 'decToHex',
    ADF_CARD: 'toFixed0',

    COM1_ACTIVE_FREQUENCY: 'toFixed3',
    COM1_STANDBY_FREQUENCY: 'toFixed3',
    COM2_ACTIVE_FREQUENCY: 'toFixed3',
    COM2_STANDBY_FREQUENCY: 'toFixed3',

    TRANSPONDER_CODE: 'padStartZero4',

    KOHLSMAN_SETTING_HG: 'toFixed2',
}

export const formattingMethod = {
    toFixed0: function(value)
    {
        return value.toFixed(0);
    },
    toFixed1: function(value)
    {
        return value.toFixed(1);
    },
    toFixed2: function(value)
    {
        return value.toFixed(2);
    },
    toFixed3: function(value)
    {
        return value.toFixed(3);
    },
    toFixed4: function(value)
    {
        return value.toFixed(4);
    },
    padStartZero4: function(value)
    {
        return String(value).padStart(4, '0');
    },
    decToHex: function(value){
        let str = value.toString(16);
        return str.substring(0, str.length - 4).padStart(4, '0');
    }
}