#! /bin/bash

cd ./repos/optimism

git clone https://github.com/ethereum-optimism/community-hub.git
git clone https://github.com/ethereum-optimism/docs.git

cd ../..
echo ☑️ cloned ok
mkdir -p output/optimism/community-hub # important
node ./scripts/0-generate-master.js "output/optimism/community-hub/master.md" "repos/optimism/community-hub"
node ./scripts/1-generate-chapters.js "output/optimism/community-hub/chapters" "output/optimism/community-hub/master.md"
node ./scripts/2-generate-keywords.js "output/optimism/community-hub/chapters" "output/optimism/community-hub/keywords.json"
echo ☑️ finished community hub
mkdir -p output/optimism/docs # important
node ./scripts/0-generate-master.js "output/optimism/docs/master.md" "repos/optimism/docs"
node ./scripts/1-generate-chapters.js "output/optimism/docs/chapters" "output/optimism/docs/master.md"
node ./scripts/2-generate-keywords.js "output/optimism/docs/chapters" "output/optimism/docs/keywords.json"
echo ☑️ finished docs

# cleanup
rm -rf ./output/optimism/community-hub/master.md
rm -rf ./output/optimism/docs/master.md

rm -rf ./repos/optimism/community-hub 
rm -rf ./repos/optimism/docs
echo ☑️ ready for zip
