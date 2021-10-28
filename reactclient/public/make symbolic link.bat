rem Additional folder links for Fonts location (different planes use different font folder locations)
mklink /D  "%cd%\assets\shared\scss\fonts" "%cd%\Fonts\"

rem Working Title G1000 NXi
mkdir "%cd%\assets\g1000nxi
mklink /D "%cd%\assets\g1000nxi\html_ui" "E:\Microsoft Flight Simulator 2020\Official\OneStore\workingtitle-g1000nxi\html_ui"

rem Flybywire A320 neo (points to community folder)
mkdir "%cd%\assets\fbwa32nx
mklink /D "%cd%\assets\fbwa32nx\html_ui" "E:\Microsoft Flight Simulator 2020\Addons\Aircrafts\flybywire-aircraft-a320-neo\html_ui"
mklink /D "%cd%\assets\fbwa32nx\html_ui\Pages\VCockpit\Instruments\Airliners\Shared" "E:\Microsoft Flight Simulator 2020\Addons\Aircrafts\flybywire-aircraft-a320-neo\html_ui\Pages\VCockpit\Instruments\Airliners\Shared"

rem Asobo
mkdir "%cd%\assets\asobo
mklink /D "%cd%\assets\asobo\html_ui" "E:\Microsoft Flight Simulator 2020\Official\OneStore\asobo-vcockpits-instruments-navsystems\html_ui"
mklink /D "%cd%\assets\asobo\html_ui\Pages\VCockpit\Instruments\Shared" "E:\Microsoft Flight Simulator 2020\Official\OneStore\asobo-vcockpits-instruments\html_ui\Pages\VCockpit\Instruments\Shared"

rem Asobo CJ4
mkdir "%cd%\assets\cj4
mklink /D "%cd%\assets\cj4\html_ui" "E:\Microsoft Flight Simulator 2020\Official\OneStore\asobo-vcockpits-instruments-cj4\html_ui"
mklink /D "%cd%\assets\cj4\html_ui\Pages\VCockpit\Instruments\Airliners\Shared" "E:\Microsoft Flight Simulator 2020\Official\OneStore\asobo-vcockpits-instruments-airliners\html_ui\Pages\VCockpit\Instruments\Airliners\Shared"
mklink /D "%cd%\assets\cj4\html_ui\Pages\VCockpit\Instruments\Shared" "E:\Microsoft Flight Simulator 2020\Official\OneStore\asobo-vcockpits-instruments\html_ui\Pages\VCockpit\Instruments\Shared"



