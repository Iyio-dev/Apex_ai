import test from "node:test";
import assert from "node:assert/strict";
import { getPaginationOptions } from "../src/utils/pagination.js";
import { paginateQuery } from "../src/utils/paginateQuery.js";

test("pagination defaults to offset 0 and limit 20", () => {
  assert.deepEqual(getPaginationOptions(), { offset: 0, limit: 20 });
});

test("pagination accepts valid custom options", () => {
  assert.deepEqual(getPaginationOptions({ offset: "20", limit: "50" }), {
    offset: 20,
    limit: 50,
  });
});

test("pagination rejects invalid options with HTTP 400", () => {
  for (const options of [
    { offset: -1 },
    { offset: 1.5 },
    { limit: 0 },
    { limit: 101 },
    { limit: "not-a-number" },
  ]) {
    assert.throws(
      () => getPaginationOptions(options),
      (error) => error.statusCode === 400,
    );
  }
});

test("paginateQuery returns results and all metadata inside pagination", async () => {
  const docs = [{ id: 1 }, { id: 2 }];
  const query = {
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    async exec() { return docs; },
  };
  const model = {
    find() { return query; },
    countDocuments() { return { async exec() { return 5; } }; },
  };

  const result = await paginateQuery({
    model,
    filter: { user: "user-id" },
    options: { offset: 2, limit: 2 },
  });

  assert.deepEqual(result.results, docs);
  assert.deepEqual(result.pagination, {
    total: 5,
    offset: 2,
    limit: 2,
    totalPages: 3,
    hasNextPage: true,
    hasPrevPage: true,
  });
});

test("paginateQuery handles an empty result set", async () => {
  const query = {
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    async exec() { return []; },
  };
  const model = {
    find() { return query; },
    countDocuments() { return { async exec() { return 0; } }; },
  };

  const result = await paginateQuery({ model });
  assert.deepEqual(result.results, []);
  assert.deepEqual(result.pagination, {
    total: 0,
    offset: 0,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
});
