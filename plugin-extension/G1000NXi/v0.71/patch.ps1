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
$mfd_patch_file_1 = "MFD1.js"
$mfd_patch_file_2 = "MFD2.js"
$mfd_patch_file_3 = "MFD3.js"

# Make a copy of original first
if(-not (Test-Path -Path $mfd_backup_file_path)) {
    # Make a copy of original first
    Copy-Item $mfd_file_path -Destination $mfd_backup_file_path
}

$input = Get-Content $mfd_file_path -Raw

# Add LVAR variables to top of file
$pattern = "const SoftkeyLabel = \{(.|\n)*?(\n\})(.|\n)*?(\n\})(.|\n)*?(\n\})"
$sel = $input | Select-String -Pattern $pattern

if($sel)
{
   $input = $input -replace $pattern, (Get-Content $mfd_patch_file_1 -Raw) 
}
else
{
   $input = -join((Get-Content $mfd_patch_file_1 -Raw), $input)
}

# Update renderToSoftKeys() function to allow output of softkey labels LVAR
$pattern = "renderToSoftKeys\(\) {((.|\n)*?)}\s*\n"
$input = $input -replace $pattern, (Get-Content $mfd_patch_file_2 -Raw)

# Update handleSoftKey() function to allow output of softkey LVAR
$pattern = "handleSoftKey\(hEvent\) {((.|\n)*?)}\s*\n"
$input = $input -replace $pattern, (Get-Content $mfd_patch_file_3 -Raw)

$input | Set-Content -Path $mfd_file_path

################## Update PFD.js file #####################
$pfd_file_path = -join($installationPath, '\Official\OneStore\workingtitle-g1000nxi\html_ui\Pages\VCockpit\Instruments\NavSystems\WTG1000\PFD\PFD.js')
$pfd_backup_file_path = -join($installationPath, '\Official\OneStore\workingtitle-g1000nxi\html_ui\Pages\VCockpit\Instruments\NavSystems\WTG1000\PFD\PFD.js.backup')
$pfd_patch_file_1 = "PFD1.js"
$pfd_patch_file_2 = "PFD2.js"
$pfd_patch_file_3 = "PFD3.js"

# Make a copy of original first
if(-not (Test-Path -Path $pfd_backup_file_path)) {
    # Make a copy of original first
    Copy-Item $pfd_file_path -Destination $pfd_backup_file_path
}

$input = Get-Content $pfd_file_path -Raw

# Add LVAR variables to top of file
$pattern = "const SoftkeyLabel = \{(.|\n)*?(\n\})(.|\n)*?(\n\})(.|\n)*?(\n\})"
$sel = $input | Select-String -Pattern $pattern

if($sel)
{
   $input = $input -replace $pattern, (Get-Content $pfd_patch_file_1 -Raw) 
}
else
{
   $input = -join((Get-Content $pfd_patch_file_1 -Raw), $input)
}

# Update renderToSoftKeys() function to allow output of softkey LVAR
$pattern = "renderToSoftKeys\(\) {((.|\n)*?)}\s*\n"
$input = $input -replace $pattern, (Get-Content $pfd_patch_file_2 -Raw)

# Update handleSoftKey() function to allow output of softkey LVAR
$pattern = "handleSoftKey\(hEvent\) {((.|\n)*?)}\s*\n"
$input = $input -replace $pattern, (Get-Content $pfd_patch_file_3 -Raw)

$input | Set-Content -Path $pfd_file_path


Write-Output "G1000 NXi PFD.js and MFD.js are patched successfully!"