import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const workspaceRequire=createRequire(new URL('../packages/paper-ink/package.json',import.meta.url));
const require=createRequire(workspaceRequire.resolve('@tabler/icons-react'));
const root=require.resolve.paths('@tabler/icons').map(path=>join(path,'@tabler/icons')).find(path=>existsSync(join(path,'icons.json')));
if(!root)throw Error('Installed Tabler metadata not found');
const metadata=JSON.parse(readFileSync(join(root,'icons.json'),'utf8'));
const groups={
 navigation:['Arrows','Map'],
 editing:['Text','Design','Gestures'],
 documents:['Document'],
 layout:['System','Shapes','Logic','Extensions'],
 communication:['Communication','Mood','Gender'],
 media:['Media','Photography'],
 data:['Charts','Database','Math','Numbers','Currencies'],
 development:['Computers','Devices','Development','Electrical','Version control'],
 other:['Animals','Badges','Brand','Buildings','E-commerce','Food','Games','Health','Laundry','Letters','Nature','Sport','Symbols','Vehicles','Weather','Zodiac'],
};
const output={};
for(const [key,categories] of Object.entries(groups))output[key]=Object.values(metadata).filter(icon=>categories.includes(icon.category)).map(icon=>icon.name.replace(/[^a-z0-9]/g,'')).sort();
const known=new Set(Object.values(groups).flat());
for(const icon of Object.values(metadata))if(!known.has(icon.category))throw Error('Unmapped category: '+icon.category);
writeFileSync(new URL('../apps/website/src/pages/icon-categories.json',import.meta.url),JSON.stringify(output)+'\n');
console.log('Generated icon categories from installed Tabler metadata');
