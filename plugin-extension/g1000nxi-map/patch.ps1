$webserverIP = '192.168.1.180'
$localAppDataPath = -join($env:LOCALAPPDATA, '\Packages\Microsoft.FlightSimulator_8wekyb3d8bbwe\LocalCache\UserCfg.opt') 
$appDataPath = -join($env:APPDATA, '\Microsoft.FlightSimulator_8wekyb3d8bbwe\LocalCache\UserCfg.opt') 

#Get MSFS application installation path
if(Test-Path -Path $localAppDataPath){
    # For MS Store version of game
    $UserCfg = Get-Content $localAppDataPath -Raw
}
elseif(Test-Path -Path $appDataPath){
    # For steam version of game
    $UserCfg = Get-Content $appDataPath -Raw
}
else{
    throw 'The MSFS UserCfg.opt does not exist.'
}

$installationPath = [regex]::match($UserCfg, 'InstalledPackagesPath "((.|\n)*?)"').Groups[1].Value

################## Update MFD.js file #####################

$mfd_file_path = -join($installationPath, '\Official\OneStore\workingtitle-g1000nxi\html_ui\Pages\VCockpit\Instruments\NavSystems\WTG1000\MFD\MFD.js')
$mfd_backup_file_path = -join($installationPath, '\Official\OneStore\workingtitle-g1000nxi\html_ui\Pages\VCockpit\Instruments\NavSystems\WTG1000\MFD\MFD.js.backup')
$mfd_patch_file_1 = 'MFD1.txt'
$mfd_patch_file_2 = 'MFD2.txt'

# Make a copy of original first
if(-not (Test-Path -Path $mfd_backup_file_path)) {
    # Make a copy of original first
    Copy-Item $mfd_file_path -Destination $mfd_backup_file_path
}

$input = Get-Content $mfd_file_path -Raw

# add onPostFlightPlan() function
$pattern = 'onPostFlightPlan\(\) {'
$sel = $input | Select-String -Pattern $pattern

if($sel -eq $null)
{
    $pattern = 'class FlightPlanner {\s*\n'
    $input = $input -replace $pattern, (Get-Content $mfd_patch_file_1 -Raw)

    # replace webserver IP address
    $pattern = 'XXX.XXX.XXX.XXX'
    $input = $input -replace $pattern, $webserverIP
}

# add sendEvent() function
$pattern = "if\(topic === 'fplCalculated'\) this.onPostFlightPlan\(\);"
$sel = $input | Select-String -Pattern $pattern

if($sel -eq $null)
{
    $pattern = 'this.publisher.pub\(topic, data, false, false\);'
    $input = $input -replace $pattern, (Get-Content $mfd_patch_file_2 -Raw)
}

$input | Set-Content -Path $mfd_file_path

Write-Output 'G1000 NXi MFD.js are patched successfully!'