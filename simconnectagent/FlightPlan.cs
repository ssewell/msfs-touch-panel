using CoordinateSharp;
using IniParser;
using IniParser.Model;
using MSFSTouchPanel.Shared;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class FlightPlan
    {
        public static string ParseCustomFLT(string filePath)
        {
            var wayPoints = new List<ATCWaypoint>();

            try
            {
                var parser = new FileIniDataParser();
                var data = parser.ReadFile(filePath);

                var isActiveFlightPlan = Convert.ToBoolean(data["ATC_Aircraft.0"]["ActiveFlightPlan"]);
                var isRequestedFlightPlan = Convert.ToBoolean(data["ATC_Aircraft.0"]["RequestedFlightPlan"]);

                KeyDataCollection flightPlan;

                // If FLT file has both requested and active flight plan set to true, requested flight plan takes precedence
                if (isRequestedFlightPlan)
                {
                    flightPlan = data["ATC_RequestedFlightPlan.0"];
                }
                else if (isActiveFlightPlan)
                {
                    flightPlan = data["ATC_ActiveFlightPlan.0"];
                }
                else
                {
                    return JsonConvert.SerializeObject(wayPoints);
                }

                if (flightPlan != null)
                {
                    int i = 0;
                    Coordinate c;

                    while (true)
                    {
                        var waypointData = flightPlan["waypoint." + i];

                        if (waypointData == null)
                            break;

                        var waypointArr = waypointData.Split(",");

                        var waypoint = new ATCWaypoint();
                        waypoint.type = waypointArr[4].Trim();
                        waypoint.description = waypointArr[3].Trim();

                        // exclude unnecessary user waypoints
                        if (!(waypoint.type == "V" || (waypoint.type == "U" && (waypoint.description == "TIMECLIMB" || waypoint.description == "TIMECRUIS" || waypoint.description == "TIMEDSCNT" || waypoint.description == "TIMEAPPROACH" || waypoint.description == "TIMEVERT"))))
                        {
                            waypoint.id = waypoint.type == "U" ? waypoint.description : waypointArr[1].Trim();

                            // parse "+003000.00" - 3000ft
                            var alt = Convert.ToInt32(waypointArr[17].Trim());
                            waypoint.altitude = alt == 0 ? null : alt;

                            var spd = Convert.ToInt32(waypointArr[16].Trim());
                            waypoint.maxSpeed = spd == 0 ? null : spd;

                            Coordinate.TryParse(waypointArr[5].Trim() + " " + waypointArr[6].Trim(), out c);
                            waypoint.latLong = new double[] { c.Latitude.DecimalDegree, c.Longitude.DecimalDegree };


                            waypoint.departureProcedure = String.IsNullOrEmpty(waypointArr[9].Trim()) ? null : waypointArr[9].Trim();
                            waypoint.arrivalProcedure = String.IsNullOrEmpty(waypointArr[10].Trim()) ? null : waypointArr[10].Trim();

                            waypoint.approachType = String.IsNullOrEmpty(waypointArr[11].Trim()) ? null : waypointArr[11].Trim();
                            waypoint.approachRunway = String.IsNullOrEmpty(waypointArr[12].Trim()) ? null : waypointArr[12].Trim();

                            wayPoints.Add(waypoint);
                        }

                        i++;
                    }
                }

                return JsonConvert.SerializeObject(wayPoints);
            }
            catch (Exception ex)
            {
                Logger.ServerLog(ex.Message, LogLevel.ERROR);
                return JsonConvert.SerializeObject(wayPoints);
            }
        }
    }

    internal class ATCWaypoint
    {
        public string id { get; set; }

        public string description { get; set; }

        [JsonProperty("type")]
        public string type { get; set; }

        public double[] latLong { get; set; }

        public int? altitude { get; set; }

        public int? maxSpeed { get; set; }

        public string departureProcedure { get; set; }

        public string arrivalProcedure { get; set; }

        public string approachType { get; set; }

        public string approachRunway { get; set; }
    }
}
