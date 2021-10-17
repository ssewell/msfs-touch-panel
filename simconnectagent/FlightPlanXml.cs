using CoordinateSharp;
using MSFSTouchPanel.Shared;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Xml;

namespace MSFSTouchPanel.SimConnectAgent
{
    public class FlightPlanXml
    {
        //ToDo ************** parsing PLN File ***********************

        public static string ParseCustomPLN(string filePath)
        {
            var wayPoints = new List<ExpandoObject>();

            try
            {
                var doc = new XmlDocument();
                doc.Load(filePath);

                var json = JsonConvert.SerializeXmlNode(doc.DocumentElement, Newtonsoft.Json.Formatting.None, true);
                var data = JsonConvert.DeserializeObject<FlightPlanContainer>(json);

                Coordinate c;

                if (data.FlightPlan.ATCWaypoint == null)
                    return JsonConvert.SerializeObject(wayPoints);

                for (int i = 0; i < data.FlightPlan.ATCWaypoint.Count; i++)
                {
                    var arr = data.FlightPlan.ATCWaypoint[i].WorldPosition.Split(",");
                    var position = arr[0] + " " + arr[1];
                    Coordinate.TryParse(position, out c);

                    dynamic waypoint = new ExpandoObject();
                    waypoint.id = data.FlightPlan.ATCWaypoint[i].Id;
                    waypoint.type = data.FlightPlan.ATCWaypoint[i].type;
                    waypoint.latLong = new double[] { c.Latitude.DecimalDegree, c.Longitude.DecimalDegree };
                    waypoint.description = data.FlightPlan.ATCWaypoint[i].Description;
                    wayPoints.Add(waypoint);
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

    public class FlightPlanContainer
    {
        [JsonProperty("FlightPlan.FlightPlan")]
        public FlightPlanInfo FlightPlan { get; set; }
    }

    public class FlightPlanInfo
    {
        [JsonIgnore]
        public List<ElementWp> ATCWaypoint { get; set; }

        [JsonProperty(PropertyName = "ATCWaypoint")]
        public JRaw ATCWaypointRaw
        {
            get { return new JRaw(JsonConvert.SerializeObject(ATCWaypoint)); }
            set
            {
                var raw = value.ToString(Newtonsoft.Json.Formatting.None);
                ATCWaypoint = raw.StartsWith("[")
                    ? JsonConvert.DeserializeObject<List<ElementWp>>(raw)
                    : new List<ElementWp> { JsonConvert.DeserializeObject<ElementWp>(raw) };
            }
        }
    }

    public class ElementWp
    {
        [JsonProperty("@id")]
        public string Id { get; set; }

        public string Description { get; set; }

        [JsonProperty("ATCWaypointType")]
        public string type { get; set; }

        public string WorldPosition { get; set; }

        [JsonProperty("Alt1FP")]
        public int? Altitude { get; set; }
    }
}
