#!/bin/bash
cp src/assets/config/config.development.json src/assets/config/config_backup
sed "s@\"host\": \"http://localhost\"@\"host\": \"http://$BACKEND_HOST\"@g" src/assets/config/config_backup > src/assets/config/config.development.json
