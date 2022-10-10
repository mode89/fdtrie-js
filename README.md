# fdtrie-js
Persistent data structures with fast diff.

## Usage

Installation
```
npm install fdtrie
```

Import
```js
import {PHashMap} from "fdtrie";
```

Create an empty persistent hash map
```js
const m0  = PHashMap.blank();
```

Add entry into the map (returns new map object)
```js
const m1 = m0.assoc("some-key", "some-value");
```

Remove entry from the map (returns new map object)
```js
const m2 = m1.dissoc("some-key");
```

Get value by key (returns `undefined` if key not found)
```js
const someValue = m1.get("some-key");
```

Get value by key and return `notFound` if key not found
```js
const notFound = {};
const anotherValue = m1.get("another-value", notFound);
```

Count entries
```js
const n = m1.count();
```

Iterate through key-value pairs (returns generator object)
```js
for (const e of m1.entries()) {
    console.log(e.key, e.value);
}
```

Calculate difference (returns a map that holds key-value pairs of the first map, which don't present in the second map)
```js
const m3 = m1.difference(m0);
```

## Testing

Run unit tests
```
npm test
```

Run property-based tests
```
npm run test-props
```

## Benchmarking

Run benchmarks
```
npm run bench
```

Results:
```
CPU: Intel Core i5-9400F
RAM: 16 GB
Linux kernel: 5.19.12
Node v18.10.0

Associate a key with a value
  PHashMap: 51 ms
  ImmutableJS: 51 ms
  Mori: 49 ms
  Native: 8 ms

Get a value by a key
  PHashMap: 13 ms
  ImmutableJS: 12 ms
  Mori: 8 ms
  Native: 1 ms

Delete a key
  PHashMap: 48 ms
  ImmutableJS: 49 ms
  Mori: 54 ms
  Native: 0 ms

Single key difference
  PHashMap: 949 ns
  ImmutableJS: 8545869 ns
  Mori: 5904032 ns

All keys difference
  PHashMap: 10 ms
  ImmutableJS: 43 ms
  Mori: 27 ms

Reduce difference (single key)
  PHashMap: 458 ns
  ImmutableJS: 18070695 ns
  Mori: 11168898 ns

Reduce difference (all keys)
  PHashMap: 7 ms
  ImmutableJS: 23 ms
  Mori: 15 ms
```
