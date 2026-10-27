Get-ChildItem (Join-Path $PSScriptRoot "..\assets\img\*.jpg") | ForEach-Object {
  $b = [System.IO.File]::ReadAllBytes($_.FullName)
  $sig = (($b[0..1] | ForEach-Object { $_.ToString("X2") }) -join "")
  $ok = if ($sig -eq "FFD8") { "JPEG-OK" } else { "INVALID" }
  Write-Output ("$($_.Name) sig=$sig $ok bytes=$($b.Length)")
}
