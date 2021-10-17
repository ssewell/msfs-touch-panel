using System;

namespace MSFSTouchPanel.ArduinoAgent
{
    public class ArduinoInputData
    {
        public ArduinoInputData(string inputName, string inputAction)
        {
            InputName = (InputName)Enum.Parse(typeof(InputName), inputName);
            InputAction = (InputAction)Enum.Parse(typeof(InputAction), inputAction); 
        }

        public InputName InputName { get; set; }

        public InputAction InputAction { get; set; }
    }

    public enum InputAction
    {
        CW,
        CCW,
        SW,
        NONE,
        UP,
        DOWN,
        LEFT,
        RIGHT
    }

    public enum InputName
    {
        Encoder1,
        Encoder2,
        Joystick
    }
}
