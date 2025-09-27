:: Mirror current folder to backup (keeps them identical)
robocopy . ..\backup_cc_tech_hub /MIR

:: Reset local repo to match remote main exactly
git fetch origin
git reset --hard origin/main
