#!/bin/bash
cp assets/config/config.development.json assets/config/config_backup
sed "s@\"host\": \"http://localhost\"@\"host\": \"http://$BACKEND_HOST\"@g" assets/config/config_backup > assets/config/config.development.json
