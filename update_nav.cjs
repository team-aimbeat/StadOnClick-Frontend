const fs = require('fs');
const path = 'src/components/Layout/UserHeader.tsx';
let c = fs.readFileSync(path, 'utf8');
const old = 'className= relative mx-auto flex w-full flex-nowrap items-center justify-start gap-6 overflow-x-auto px-4 py-2 sm:px-6 lg:flex';
const neu = 'className=relative mx-auto flex w/full flex-nowrap items-center justify-start gap-3 overflow-x-auto px-3 py-2 sm:px-5 hide-scrollbar lg:flex';
if (!c.includes(old)) throw new Error('old missing');
c = c.replace(old, neu);
fs.writeFileSync(path, c);
