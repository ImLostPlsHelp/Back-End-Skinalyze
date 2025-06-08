import { openDB } from 'idb';

const DATABASE_NAME = "RiwayatScanning";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "riwayat-scanning";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: "id",
      autoIncrement: true,
    });
  },
});