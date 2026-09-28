#!/bin/bash
# Removes the `aps-environment` key that expo-notifications' config plugin always adds to
# ios/RITMO/RITMO.entitlements on every `expo prebuild`. RITMO only schedules local
# notifications (never remote push), and Apple's free "Personal Team" signing refuses to
# build any target whose entitlements request the Push Notifications capability at all — so
# this key must go before building to a device with a free Apple ID.
#
# A config plugin (withEntitlementsPlist / withDangerousMod) could not do this reliably: in
# Expo SDK 57, both ran before expo-notifications' own entitlements mod had added the key, so
# this runs as a plain post-prebuild step instead. Run it after every
# `npx expo prebuild --platform ios` and before building.
set -euo pipefail
cd "$(dirname "$0")/.."
/usr/libexec/PlistBuddy -c "Delete :aps-environment" ios/RITMO/RITMO.entitlements 2>/dev/null || true
echo "Stripped aps-environment from ios/RITMO/RITMO.entitlements"
cat ios/RITMO/RITMO.entitlements
