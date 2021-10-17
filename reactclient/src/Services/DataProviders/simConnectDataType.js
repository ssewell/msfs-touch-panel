export const simconnectDataType = {
    PLANE_TITLE: 'TITLE',
    PLANE_HEADING: 'PLANE_HEADING_DEGREES_MAGNETIC',
    PLANE_HEADING_TRUE: 'PLANE_HEADING_DEGREES_TRUE',
    PLANE_ALTITUDE: 'PLANE_ALTITUDE',
    PLANE_ALTITUDE_ABOVE_GROUND: 'PLANE_ALT_ABOVE_GROUND',
    PLANE_AIRSPEED: 'AIRSPEED_INDICATED',
    PLANE_VERTICAL_SPEED: 'VERTICAL_SPEED',
    PLANE_PITCH: 'PLANE_PITCH_DEGREES',
    PLANE_BANK: 'PLANE_BANK_DEGREES',

    TRIM_PERCENT: 'ELEVATOR_TRIM_PCT',
    FLAPS_HANDLE_INDEX: 'FLAPS_HANDLE_INDEX',
    FLAPS_HANDLE_PERCENT: 'FLAPS_HANDLE_PERCENT',
    FLAPS_ANGLE: 'TRAILING_EDGE_FLAPS_LEFT_ANGLE',
    
    GEAR_CENTER_POSITION: 'GEAR_CENTER_POSITION',
    GEAR_LEFT_POSITION: 'GEAR_LEFT_POSITION',
    GEAR_RIGHT_POSITION: 'GEAR_RIGHT_POSITION',

    ENG_THROTTLE_PERCENT: 'GENERAL_ENG_THROTTLE_LEVER_POSITION_1',
    ENG_MIXTURE_PERCENT: 'GENERAL_ENG_MIXTURE_LEVER_POSITION_1',
    ENG_PROP_RPM: 'GENERAL_ENG_RPM_1',

    AUTOPILOT_ALTITUDE: 'AUTOPILOT_ALTITUDE_LOCK_VAR',
    AUTOPILOT_HEADING: 'AUTOPILOT_HEADING_LOCK_DIR',
    AUTOPILOT_VS: 'AUTOPILOT_VERTICAL_HOLD_VAR',
    AUTOPILOT_FLC: 'AUTOPILOT_AIRSPEED_HOLD_VAR',

    NAV1_ACTIVE_FREQUENCY: 'NAV_ACTIVE_FREQUENCY_1',
    NAV1_STANDBY_FREQUENCY: 'NAV_STANDBY_FREQUENCY_1',
    NAV2_ACTIVE_FREQUENCY: 'NAV_ACTIVE_FREQUENCY_2',
    NAV2_STANDBY_FREQUENCY: 'NAV_STANDBY_FREQUENCY_2',

    ADF1_ACTIVE_FREQUENCY: 'ADF_ACTIVE_FREQUENCY_1',
    ADF1_STANDBY_FREQUENCY: 'ADF_STANDBY_FREQUENCY_1',
    ADF_CARD: 'ADF_CARD',

    NAV_OBS_1: 'NAV_OBS_1',
    NAV_OBS_2: 'NAV_OBS_2',

    COM1_ACTIVE_FREQUENCY: 'COM_ACTIVE_FREQUENCY_1',
    COM1_STANDBY_FREQUENCY: 'COM_STANDBY_FREQUENCY_1',
    COM2_ACTIVE_FREQUENCY: 'COM_ACTIVE_FREQUENCY_2',
    COM2_STANDBY_FREQUENCY: 'COM_STANDBY_FREQUENCY_2',
    COM1_TRANSMIT: 'COM_TRANSMIT_1',
    COM2_TRANSMIT: 'COM_TRANSMIT_2',

    TRANSPONDER_CODE: 'TRANSPONDER_CODE',
    KOHLSMAN_SETTING_HG: 'KOHLSMAN_SETTING_HG',

    AP_MASTER_ON: 'AUTOPILOT_MASTER',
    AP_FLIGHT_DIRECTOR_ON: 'AUTOPILOT_FLIGHT_DIRECTOR_ACTIVE',
    AP_GPS_ON: 'GPS_DRIVES_NAV1',
    AP_NAV_ON: 'AUTOPILOT_NAV1_LOCK',
    AP_VNAV_ON: 'AUTOPILOT_VNAV_LOCK',
    AP_APPROACH_ON: 'AUTOPILOT_APPROACH_HOLD',
    AP_BACK_COURSE_ON: 'AUTOPILOT_BACKCOURSE_HOLD',
    AP_YAW_DAMPER_ON: 'AUTOPILOT_YAW_DAMPER',
    AP_WING_LEVELER_ON: 'AUTOPILOT_WING_LEVELER',
    AP_AUTO_THROTTLE_ON: 'AUTOPILOT_THROTTLE_ARM',
    
    AP_ALTITUDE_HOLD_ON: 'AUTOPILOT_ALTITUDE_LOCK',
    AP_HEADING_HOLD_ON: 'AUTOPILOT_HEADING_LOCK',
    AP_VS_HOLD_ON: 'AUTOPILOT_VERTICAL_HOLD',
    AP_FLC_HOLD_ON: 'AUTOPILOT_FLIGHT_LEVEL_CHANGE',
    
    BATTERY_MASTER_ON: 'ELECTRICAL_MASTER_BATTERY',
    ALTERNATOR_MASTER_ON: 'GENERAL_ENG_MASTER_ALTERNATOR_1',
    AVIONICS_MASTER_ON: 'AVIONICS_MASTER_SWITCH',
    FUEL_PUMP_ON: 'GENERAL_ENG_FUEL_PUMP_SWITCH',
    DEICE_ON: 'STRUCTURAL_DEICE_SWITCH',
    PITOT_HEAT_ON: 'PITOT_HEAT',

    LIGHT_LANDING_ON: 'LIGHT_LANDING',
    LIGHT_TAXI_ON: 'LIGHT_TAXI',
    LIGHT_BEACON_ON: 'LIGHT_BEACON',
    LIGHT_NAV_ON: 'LIGHT_NAV',
    LIGHT_STROBE_ON: 'LIGHT_STROBE',
    LIGHT_PANEL_ON: 'LIGHT_PANEL',

    SIMULATION_RATE: 'SIMULATION_RATE',
    SIMULATION_RATE_VALID: 'SIMULATION_RATE_VALID',
    SIMULATION_RATE_INVALID_REASON: 'SIMULATION_RATE_INVALID_REASON',

    GPS_LAT: 'GPS_POSITION_LAT',
    GPS_LON: 'GPS_POSITION_LON',

    // LVAR
    PFD_SOFTKEY_1_LABEL: 'PFD_SOFTKEY_1_LABEL',
    PFD_SOFTKEY_2_LABEL: 'PFD_SOFTKEY_2_LABEL',
    PFD_SOFTKEY_3_LABEL: 'PFD_SOFTKEY_3_LABEL',
    PFD_SOFTKEY_4_LABEL: 'PFD_SOFTKEY_4_LABEL',
    PFD_SOFTKEY_5_LABEL: 'PFD_SOFTKEY_5_LABEL',
    PFD_SOFTKEY_6_LABEL: 'PFD_SOFTKEY_6_LABEL',
    PFD_SOFTKEY_7_LABEL: 'PFD_SOFTKEY_7_LABEL',
    PFD_SOFTKEY_8_LABEL: 'PFD_SOFTKEY_8_LABEL',
    PFD_SOFTKEY_9_LABEL: 'PFD_SOFTKEY_9_LABEL',
    PFD_SOFTKEY_10_LABEL: 'PFD_SOFTKEY_10_LABEL',
    PFD_SOFTKEY_11_LABEL: 'PFD_SOFTKEY_11_LABEL',
    PFD_SOFTKEY_12_LABEL: 'PFD_SOFTKEY_12_LABEL',

    MFD_SOFTKEY_1_LABEL: 'MFD_SOFTKEY_1_LABEL',
    MFD_SOFTKEY_2_LABEL: 'MFD_SOFTKEY_2_LABEL',
    MFD_SOFTKEY_3_LABEL: 'MFD_SOFTKEY_3_LABEL',
    MFD_SOFTKEY_4_LABEL: 'MFD_SOFTKEY_4_LABEL',
    MFD_SOFTKEY_5_LABEL: 'MFD_SOFTKEY_5_LABEL',
    MFD_SOFTKEY_6_LABEL: 'MFD_SOFTKEY_6_LABEL',
    MFD_SOFTKEY_7_LABEL: 'MFD_SOFTKEY_7_LABEL',
    MFD_SOFTKEY_8_LABEL: 'MFD_SOFTKEY_8_LABEL',
    MFD_SOFTKEY_9_LABEL: 'MFD_SOFTKEY_9_LABEL',
    MFD_SOFTKEY_10_LABEL: 'MFD_SOFTKEY_10_LABEL',
    MFD_SOFTKEY_11_LABEL: 'MFD_SOFTKEY_11_LABEL',
    MFD_SOFTKEY_12_LABEL: 'MFD_SOFTKEY_12_LABEL',
    
    MID_ADF_SELECTED: 'MID_ADF_SELECTED',
    MID_DME_SELECTED: 'MID_DME_SELECTED',
    MID_DME_NAV1_SELECTED: 'MID_DME_NAV1_SELECTED',
    MID_DME_NAV2_SELECTED: 'MID_DME_NAV2_SELECTED',
}
