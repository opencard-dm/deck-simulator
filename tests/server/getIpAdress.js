import dns from 'dns'
import { hostname } from 'os';

dns.lookup(hostname(), function (err, add, fam) {
  console.log('addr: ' + add);
})

import ip from 'ip'

console.log(ip.address())
