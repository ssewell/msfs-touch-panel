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

################## Remove backup files PFD.js.backup and MFD.js.backup #####################
$pfd_backup_file_path = -join($installationPath, '\Official\OneStore\workingtitle-g1000nxi\html_ui\Pages\VCockpit\Instruments\NavSystems\WTG1000\PFD\PFD.js.backup')
$mfd_backup_file_path = -join($installationPath, '\Official\OneStore\workingtitle-g1000nxi\html_ui\Pages\VCockpit\Instruments\NavSystems\WTG1000\MFD\MFD.js.backup')

if((Test-Path -Path $pfd_backup_file_path)) {
    Remove-Item $pfd_backup_file_path
}

if((Test-Path -Path $mfd_backup_file_path)) {
    Remove-Item $mfd_backup_file_path
}

Write-Output "Backup files have been removed"