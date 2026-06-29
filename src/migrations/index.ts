import * as migration_20260629_163827_init from './20260629_163827_init';

export const migrations = [
  {
    up: migration_20260629_163827_init.up,
    down: migration_20260629_163827_init.down,
    name: '20260629_163827_init'
  },
];
