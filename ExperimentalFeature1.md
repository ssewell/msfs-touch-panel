# MSFS Touch Panel Experimental Feature #1

# G1000 NXi PFD/MFD Button Frame Panel

## IMPORTANT! This experimental feature only works with Arduino input currently.

The concept of this experimental feature is to be able to code a responsive web based PFD/MFD control frame using ReactJS which then can host pop out panels from MSFS similar to Air Manager. To achieve this, a .NET windows form container uses a webview to host a PDF/MFD control frame. To achieve transparency throughout, the web page, webview and windows form will need to set the correct transparency to allow the PDF/MFD pop out panel to show through. The arduino rotary encoder input will behave similar to the Knobster by Air Manager. By touching the corresponding dial on PFD/MFD frame, the rotary encoder will serve input for that selected dial.

<div float="left">
  <img src="screenshots/app/experimental3.png" width="350" hspace="10" valign="top"/>
  <img src="screenshots/app/experimental1.png" width="350" hspace="10" valign="top"/> 
   <img src="screenshots/app/experimental2.png" width="350" hspace="10" valign="top"/> 
</div>

<br/>
 
# How to Use?
1. Launch PFD and/or MFD panel from the server application. (MSFS Touch Panel Server.exe) 

<img src="screenshots/app/experimental4.png" width="900" hspace="10" valign="top"/> 

2. Recommendation is to put the PFD/MFD frame on a separate screen, preferable a tablet screen (using tool like [spacedesk](https://www.spacedesk.net/)) or an external touch enabled monitor.

3. Resize or preferably maximize the PFD/MFD frame on the screen. The frame will keep its aspect ratio from the web page responsive design.

4. Pop out corresponding G1000 NXi PFD/MFD panel from the game and move it within the frame. You can use any 3rd party tool or my [pop out manager tool](https://github.com/hawkeye-stan/msfs-popout-panel-manager) to save the pop out location so you don't have to do this on every flight.

5. Press the gear icon in the menu bar, make sure "Use Arduino" is enabled.
 
6. All the buttons on the PFD/MFD frame will now work and behave just like touch enable buttons.

7. To control any of the dials, first press on the dial, it will then highlighted in purple. You can then control it using the Arduino encoder.

8. You can go back and forth between the touch panel application (ie. to see the moving map) and the pop out frame by pressing the "Microscope" icon in the menu bar.

* To directly access and/or debug the PFD/MFD web page frame. You can type in following URL in a browser:

	http://localhost:5000/framepanel/g1000nxi/pfd 

	http://localhost:5000/framepanel/g1000nxi/mfd 

