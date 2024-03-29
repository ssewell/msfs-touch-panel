﻿using Microsoft.FlightSimulator.SimConnect;
using System.Collections.Generic;

namespace MSFSTouchPanel.FSConnector
{
    public class DataDefinition
    {
        public static List<(string PropName, string SimConnectName, string SimConnectUnit, SIMCONNECT_DATATYPE SimConnectDataType)> GetDefinition()
        {
            var def = new List<(string, string, string, SIMCONNECT_DATATYPE)>
            {
                ("TITLE", "Title", null, SIMCONNECT_DATATYPE.STRING256),
                ("PLANE_LATITUDE", "PLANE LATITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("PLANE_LONGITUDE", "PLANE LONGITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64),

                ("PLANE_HEADING_DEGREES_MAGNETIC", "PLANE HEADING DEGREES MAGNETIC", "degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("PLANE_HEADING_DEGREES_TRUE", "PLANE HEADING DEGREES TRUE", "degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("PLANE_ALTITUDE", "PLANE ALTITUDE", "feet", SIMCONNECT_DATATYPE.FLOAT64),
                ("PLANE_ALT_ABOVE_GROUND", "PLANE ALT ABOVE GROUND", "feet", SIMCONNECT_DATATYPE.FLOAT64),
                ("AIRSPEED_INDICATED", "AIRSPEED INDICATED", "knots", SIMCONNECT_DATATYPE.FLOAT64),
                ("VERTICAL_SPEED", "VERTICAL SPEED", "feet/minute", SIMCONNECT_DATATYPE.FLOAT64),
                ("PLANE_PITCH_DEGREES", "PLANE PITCH DEGREES", "degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("PLANE_BANK_DEGREES", "PLANE BANK DEGREES", "degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("KOHLSMAN_SETTING_HG", "KOHLSMAN SETTING HG", "inHg", SIMCONNECT_DATATYPE.FLOAT64),

                ("FLAPS_HANDLE_INDEX", "FLAPS HANDLE INDEX", "number", SIMCONNECT_DATATYPE.FLOAT64),
                ("FLAPS_HANDLE_PERCENT", "FLAPS HANDLE PERCENT", "percent", SIMCONNECT_DATATYPE.FLOAT64),
                ("TRAILING_EDGE_FLAPS_LEFT_ANGLE", "TRAILING EDGE FLAPS LEFT ANGLE", "degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("ELEVATOR_TRIM_PCT", "ELEVATOR TRIM PCT", "percent", SIMCONNECT_DATATYPE.FLOAT64),
                ("AILERON_RIGHT_DEFLECTION", "AILERON RIGHT DEFLECTION", "radians", SIMCONNECT_DATATYPE.FLOAT64),
               
                ("GEAR_POSITION", "GEAR POSITION", "enum", SIMCONNECT_DATATYPE.FLOAT64),
                ("GEAR_CENTER_POSITION", "GEAR CENTER POSITION", "percent", SIMCONNECT_DATATYPE.FLOAT64),
                ("GEAR_LEFT_POSITION", "GEAR LEFT POSITION", "percent", SIMCONNECT_DATATYPE.FLOAT64),
                ("GEAR_RIGHT_POSITION", "GEAR RIGHT POSITION", "percent", SIMCONNECT_DATATYPE.FLOAT64),

                ("TRANSPONDER_CODE", "TRANSPONDER CODE:1", "number", SIMCONNECT_DATATYPE.FLOAT64),

                ("AUTOPILOT_MASTER", "AUTOPILOT MASTER", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_FLIGHT_DIRECTOR_ACTIVE", "AUTOPILOT FLIGHT DIRECTOR ACTIVE", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("GPS_DRIVES_NAV1", "GPS DRIVES NAV1", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_APPROACH_HOLD", "AUTOPILOT APPROACH HOLD", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_NAV1_LOCK", "AUTOPILOT NAV1 LOCK", "bool", SIMCONNECT_DATATYPE.FLOAT64),

                ("AUTOPILOT_ALTITUDE_LOCK", "AUTOPILOT ALTITUDE LOCK", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_ALTITUDE_LOCK_VAR", "AUTOPILOT ALTITUDE LOCK VAR:1", "feet", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_HEADING_LOCK", "AUTOPILOT HEADING LOCK", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_HEADING_LOCK_DIR", "AUTOPILOT HEADING LOCK DIR:1", "degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_VERTICAL_HOLD", "AUTOPILOT VERTICAL HOLD", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_VERTICAL_HOLD_VAR", "AUTOPILOT VERTICAL HOLD VAR", "feet/minute", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_FLIGHT_LEVEL_CHANGE", "AUTOPILOT FLIGHT LEVEL CHANGE", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_AIRSPEED_HOLD_VAR", "AUTOPILOT AIRSPEED HOLD VAR", "knots", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_YAW_DAMPER", "AUTOPILOT YAW DAMPER", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_WING_LEVELER", "AUTOPILOT WING LEVELER", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_THROTTLE_ARM", "AUTOPILOT THROTTLE ARM", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AUTOPILOT_BACKCOURSE_HOLD", "AUTOPILOT BACKCOURSE HOLD", "bool", SIMCONNECT_DATATYPE.FLOAT64),

                ("ELECTRICAL_MASTER_BATTERY", "ELECTRICAL MASTER BATTERY", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("GENERAL_ENG_MASTER_ALTERNATOR_1", "GENERAL ENG MASTER ALTERNATOR:1", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("AVIONICS_MASTER_SWITCH", "AVIONICS MASTER SWITCH", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("GENERAL_ENG_FUEL_PUMP_SWITCH", "GENERAL ENG FUEL PUMP SWITCH:1", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("STRUCTURAL_DEICE_SWITCH", "STRUCTURAL DEICE SWITCH", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("PITOT_HEAT", "PITOT HEAT", "bool", SIMCONNECT_DATATYPE.FLOAT64),

                ("LIGHT_LANDING", "LIGHT LANDING", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("LIGHT_TAXI", "LIGHT TAXI", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("LIGHT_NAV", "LIGHT NAV", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("LIGHT_BEACON", "LIGHT BEACON", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("LIGHT_STROBE", "LIGHT STROBE", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("LIGHT_PANEL", "LIGHT PANEL", "bool", SIMCONNECT_DATATYPE.FLOAT64),

                ("PROP_RPM_1", "PROP RPM:1", "rpm", SIMCONNECT_DATATYPE.FLOAT64),
                ("TURB_ENG_CORRECTED_N1_1", "TURB ENG CORRECTED N1:1", "percent", SIMCONNECT_DATATYPE.FLOAT64),

                ("GENERAL_ENG_RPM_1", "GENERAL ENG RPM:1", "rpm", SIMCONNECT_DATATYPE.FLOAT64),
                ("GENERAL_ENG_THROTTLE_LEVER_POSITION_1", "GENERAL ENG THROTTLE LEVER POSITION:1", "percent", SIMCONNECT_DATATYPE.FLOAT64),
                ("GENERAL_ENG_MIXTURE_LEVER_POSITION_1", "GENERAL ENG MIXTURE LEVER POSITION:1", "percent", SIMCONNECT_DATATYPE.FLOAT64),

                ("NAV_ACTIVE_FREQUENCY_1", "NAV ACTIVE FREQUENCY:1", "mhz", SIMCONNECT_DATATYPE.FLOAT64),
                ("NAV_STANDBY_FREQUENCY_1", "NAV STANDBY FREQUENCY:1", "mhz", SIMCONNECT_DATATYPE.FLOAT64),
                ("NAV_ACTIVE_FREQUENCY_2", "NAV ACTIVE FREQUENCY:2", "mhz", SIMCONNECT_DATATYPE.FLOAT64),
                ("NAV_STANDBY_FREQUENCY_2", "NAV STANDBY FREQUENCY:2", "mhz", SIMCONNECT_DATATYPE.FLOAT64),

                ("ADF_ACTIVE_FREQUENCY_1", "ADF ACTIVE FREQUENCY:1", "Frequency ADF BCD32", SIMCONNECT_DATATYPE.FLOAT64),
                ("ADF_STANDBY_FREQUENCY_1", "ADF STANDBY FREQUENCY:1", "Frequency ADF BCD32", SIMCONNECT_DATATYPE.FLOAT64),
                ("ADF_CARD", "ADF CARD", "Degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("NAV_OBS_1", "NAV OBS:1", "Degrees", SIMCONNECT_DATATYPE.FLOAT64),
                ("NAV_OBS_2", "NAV OBS:2", "Degrees", SIMCONNECT_DATATYPE.FLOAT64),
                
                ("COM_ACTIVE_FREQUENCY_1", "COM ACTIVE FREQUENCY:1", "mhz", SIMCONNECT_DATATYPE.FLOAT64),
                ("COM_STANDBY_FREQUENCY_1", "COM STANDBY FREQUENCY:1", "mhz", SIMCONNECT_DATATYPE.FLOAT64),
                ("COM_ACTIVE_FREQUENCY_2", "COM ACTIVE FREQUENCY:2", "mhz", SIMCONNECT_DATATYPE.FLOAT64),
                ("COM_STANDBY_FREQUENCY_2", "COM STANDBY FREQUENCY:2", "mhz", SIMCONNECT_DATATYPE.FLOAT64),

                ("COM_TRANSMIT_1", "COM TRANSMIT:1", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                ("COM_TRANSMIT_2", "COM TRANSMIT:2", "bool", SIMCONNECT_DATATYPE.FLOAT64),
                
                ("SIMULATION_RATE", "SIMULATION RATE", "number", SIMCONNECT_DATATYPE.FLOAT64),

                ("GPS_WP_PREV_LAT", "GPS WP PREV LAT", "radians", SIMCONNECT_DATATYPE.FLOAT64),
                ("GPS_WP_PREV_LON", "GPS WP PREV LON", "radians", SIMCONNECT_DATATYPE.FLOAT64),
                ("GPS_WP_NEXT_LAT", "GPS WP NEXT LAT", "radians", SIMCONNECT_DATATYPE.FLOAT64),
                ("GPS_WP_NEXT_LON", "GPS WP NEXT LON", "radians", SIMCONNECT_DATATYPE.FLOAT64),
                ("GPS_POSITION_LAT", "GPS POSITION LAT", "radians", SIMCONNECT_DATATYPE.FLOAT64),
                ("GPS_POSITION_LON", "GPS POSITION LON", "radians", SIMCONNECT_DATATYPE.FLOAT64),
                ("GPS_GROUND_SPEED", "GPS GROUND SPEED", "meters per second", SIMCONNECT_DATATYPE.FLOAT64)
            };

            return def;
        }
    }
}
