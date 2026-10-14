import sharp from 'sharp';
import {mkdir, writeFile} from 'node:fs/promises';

// Derive native artwork from Atlas's existing vector mark, without text.
const root = 'ios/App/App/Assets.xcassets';
await sharp('public/favicon.svg', {density: 1152}).resize(1024, 1024)
  .flatten({background: '#2b2117'}).png()
  .toFile(`${root}/AppIcon.appiconset/AppIcon-512@2x.png`);
await mkdir(`${root}/LaunchMark.imageset`, {recursive: true});
await sharp('public/favicon.svg', {density: 432}).resize(384, 384).png()
  .toFile(`${root}/LaunchMark.imageset/mark.png`);
await writeFile(`${root}/LaunchMark.imageset/Contents.json`, JSON.stringify({
  images: [{filename: 'mark.png', idiom: 'universal', scale: '3x'}],
  info: {author: 'xcode', version: 1},
}, null, 2) + '\n');
