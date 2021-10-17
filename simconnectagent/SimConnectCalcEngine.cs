using System;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class SimConnectCalcEngine
    {
        public static SimRateValidArg SimRateValid(SimRateVar simRateVar)
        {
            // Check if sim rate time accelaration is allowed
            // Must pass all criteria below

            // check if autopilot approach mode is turned off
            if (simRateVar.APApproachHold)
                return new SimRateValidArg(false, "Autopilot approach mode is on");

            // check if plane altitude above ground is >= 500 feet
            if (simRateVar.AltitudeAboveGround < 500)
                return new SimRateValidArg(false, "Altitude is below 500 ft above ground");

            // check if vertical speed less than +/- 4000 feet/min
            if (Math.Abs(simRateVar.VerticalSpeed) > 4000)
                return new SimRateValidArg(false, "Vertical speed is more than +/-4000 ft/min");

            // check if plane ptich degrees < 15 to avoid over agressive pitch
            if (Math.Abs(simRateVar.PitchDegree) > 15)
                return new SimRateValidArg(false, "Pitch angle is greater than 15 degrees");

            // check if plane bank degrees < 8 to avoid over agressive bank
            if (Math.Abs(simRateVar.BankDegree) > 8)
                return new SimRateValidArg(false, "Bank angle is greater than 8 degrees");

            var distance = CalculateDistance(simRateVar.WayPointNextLat, simRateVar.WayPointNextLon, simRateVar.PositionLat, simRateVar.PositionLon);
            var groundSpeedMilesPerSecond = simRateVar.GroundSpeed * 2.24 / 60.0 / 60.0;   // convert meters/second to miles/second

            // check if current position is closer than 15 seconds from next waypoint based on current speed
            // this buffer is created because MSFS autopilot may cut corner to next waypoint
            if (distance / groundSpeedMilesPerSecond <= 15)
                return new SimRateValidArg(false, "Current position is closer than 30 seconds from next waypoint with current speed");

            distance = CalculateDistance(simRateVar.WayPointPreviousLat, simRateVar.WayPointPreviousLon, simRateVar.PositionLat, simRateVar.PositionLon);

            // check if current position is closer than 15 seconds from prev waypoint based on current speed
            if (distance / groundSpeedMilesPerSecond <= 15)
                return new SimRateValidArg(false, "Current position is closer than 30 seconds from previous waypoint with current speed");

            return new SimRateValidArg(true, "Sim Rate Increase/Decrease is available");
        }

        private static double CalculateDistance(double radlat1, double radlon1, double radlat2, double radlon2) {
            if ((radlat1 == radlat2) && (radlon1 == radlon2))
            {
                return 0;
            }
            else
            {
                var radtheta = radlon1 - radlon2;
                var dist = Math.Sin(radlat1) * Math.Sin(radlat2) + Math.Cos(radlat1) * Math.Cos(radlat2) * Math.Cos(radtheta);
                
                if (dist > 1)
                    dist = 1;
                
                dist = Math.Acos(dist);
                dist = dist * 180 / Math.PI;
                dist = dist * 60 * 1.1515;
               
                return dist;                // return as miles
            }
        }
    }

    public class SimRateVar
    {
        public bool APApproachHold { get; set; }
        
        public double AltitudeAboveGround { get; set; }

        public double GroundSpeed { get; set; }

        public double VerticalSpeed { get; set; }

        public double PitchDegree { get; set; }

        public double BankDegree { get; set; }

        public double WayPointNextLat { get; set; }

        public double WayPointNextLon { get; set; }

        public double WayPointPreviousLat { get; set; }

        public double WayPointPreviousLon { get; set; }

        public double PositionLat { get; set; }

        public double PositionLon { get; set; }
    }

    public class SimRateValidArg
    {
        public SimRateValidArg(bool isValid, string invalidReason)
        {
            IsValid = isValid;
            InvalidReason = invalidReason;
        }

        public bool IsValid { get; set; }

        public string InvalidReason { get; set; }
    }
}
