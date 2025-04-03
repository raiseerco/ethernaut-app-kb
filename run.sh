#! /bin/bash
rm -rf chatpers
rm -rf repos/community-hub
cd repos
git clone https://github.com/ethereum-optimism/community-hub.git
cd ..
node scripts/0-generate-master.js
node scripts/1-generate-chapters.js
rm -rf repos/community-hub