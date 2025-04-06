#! /bin/bash

cd ./repos/optimism

git clone https://github.com/ethereum-optimism/community-hub.git
# git clone https://github.com/ethereum-optimism/docs.git

cd ../..
node ./scripts/0-generate-master.js
node ./scripts/1-generate-chapters.js
node ./scripts/2-generate-keywords.js
# cleanup
rm -rf ./output/master.md
rm -rf ./repos/optimism/community-hub 


