Candidate Name: Kelvin Smith

Tasks: 2 & 3

Time: 4+ hours (worked intermittently over a Sunday)

Notes:

I've decided to choose the second task as I'm more comfortable with server development at the moment.

I've tried drive everything via integration tests at the API level i.e. `index.spec.ts`. I've included a utility fucking to clear the database between tests, though I'd prefer something more robust (possibly using transactions).

The get all meter readings you would send a GET request to `/meter-readings` and to create a new reading, POST to the same endpoint.

When calculating usage I'd prefer to have written unit tests but opted to focus on getting the structure correct and getting something workable out. In practice I would take more time to make sure I have coverage for cases like reading edges [first and last readings when they are not at the end of the month].

Data level functions are declared inside the `data.ts` module.

Interesting logical calculations can be found in `usage.ts`. This module is responsible for interpolating monthly readings and calculating usage per month.

Usage is exposed via the `/energy-usage` endpoint and is represented as an array of objects with the following structure:

```ts
interface Usage {
  year: number;
  month: number;
  usage: number;
}
```
