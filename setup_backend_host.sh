#!/bin/bash
cp dist/assets/config/config.development.json dist/assets/config/config_backup
sed "s@\"host\": \"http://localhost\"@\"host\": \"http://$BACKEND_HOST\"@g" dist/assets/config/config_backup > dist/assets/config/config.development.json
