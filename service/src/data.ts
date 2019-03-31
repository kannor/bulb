import * as sqlite3 from 'sqlite3';
const sampleData = require('../sampleData.json');

const SQLite = sqlite3.verbose();

export const connection = new SQLite.Database(':memory:');

/**
 * Imports the data from the sampleData.json file into a `meter_reads` table.
 * The table contains three columns - cumulative, reading_date and unit.
 *
 * An example query to get all meter reads,
 *   connection.all('SELECT * FROM meter_reads', (error, data) => console.log(data));
 *
 * Note, it is an in-memory database, so the data will be reset when the
 * server restarts.
 */
export function initialize(): void {
  connection.serialize(() => {
    connection.run(
      'CREATE TABLE meter_reads (cumulative INTEGER, reading_date TEXT, unit TEXT)'
    );

    const { electricity } = sampleData;
    electricity.forEach(data => {
      connection.run(
        'INSERT INTO meter_reads (cumulative, reading_date, unit) VALUES (?, ?, ?)',
        [data.cumulative, data.readingDate, data.unit]
      );
    });
  });
}

export function cleanup(): void {
  connection.run('DROP TABLE meter_reads');
}

export function all(): Promise<any[]> {
  const query = `SELECT cumulative, reading_date as readingDate, unit
                 FROM meter_reads
                 ORDER BY cumulative`;

  return new Promise<any[]>((resolve, reject) => {
    connection.serialize(() => {
      connection.all(query, (error, rows) => {
        if (error) {
          reject(error);
        }

        resolve(rows);
      });
    });
  });
}

export function insert(reading: any): Promise<any> {
  return new Promise<any[]>((resolve, reject) => {
    connection.run(
      'INSERT INTO meter_reads (cumulative, reading_date, unit) VALUES (?, ?, ?)',
      [reading.cumulative, reading.readingDate, reading.unit],
      error => {
        if (error) {
          console.error(error);
          reject(error);
        }
        resolve(reading);
      }
    );
  });
}
