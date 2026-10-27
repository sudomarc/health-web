# Télécharge des images de démonstration depuis Unsplash (licence Unsplash, usage libre).
# Exécuté depuis la racine du dépôt health-web.
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "..\assets\img"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$images = @{
  # Médecin et patient — héros
  "hero-clinician.jpg" = "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=1400&q=72&fm=jpg&fit=crop"
  # Salle d'attente / accueil
  "clinic-reception.jpg" = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=72&fm=jpg&fit=crop"
  # Équipe soignante
  "care-team.jpg" = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=72&fm=jpg&fit=crop"
  # Consultation
  "consultation.jpg" = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=72&fm=jpg&fit=crop"
  # Bâtiment / architecture médicale moderne
  "facility-exterior.jpg" = "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&q=72&fm=jpg&fit=crop"
  # Technologie médicale
  "medical-tech.jpg" = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=72&fm=jpg&fit=crop"
}

foreach ($name in $images.Keys) {
  $out = Join-Path $dir $name
  try {
    Invoke-WebRequest -Uri $images[$name] -OutFile $out -TimeoutSec 45 -UseBasicParsing | Out-Null
    $len = (Get-Item $out).Length
    Write-Output "OK   $name ($len bytes)"
  } catch {
    Write-Output "FAIL $name : $($_.Exception.Message)"
  }
}
