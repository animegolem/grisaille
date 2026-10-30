import {readFileSync} from 'node:fs';
import {decodePaletteArtifact} from '/Users/golem/git/grisaille/src/palette-contract.ts';
const base='/Users/golem/git/grisaille/tests/fixtures/palette/';
const track=JSON.parse(readFileSync('/private/tmp/grisaille-rmpc-track-review-output.json','utf8'));
console.log({serializedTrack:track});
for(const file of ['failed-no-identity','no-art']) {
 const v=JSON.parse(readFileSync(base+file+'.json','utf8'));
 console.log({file, baseline:decodePaletteArtifact(JSON.stringify(v)).ok});
 v.track={...track,file:v.track.file,art_sha256:v.track.art_sha256};
 const r=decodePaletteArtifact(JSON.stringify(v));
 console.log({file,withProducerMetadata:r});
}
