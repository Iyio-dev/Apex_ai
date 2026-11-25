import test from "node:test";
import assert from "node:assert/strict";
import { normalizeError } from "../src/middleware/errorMiddleware.js";
import AppError from "../src/utils/AppError.js";

test("operational errors preserve safe codes and status", () => {
 const err=normalizeError(new AppError("Missing",404));
 assert.equal(err.statusCode,404); assert.equal(err.code,"NOT_FOUND");
});
test("duplicate database keys become safe conflict errors", () => {
 const err=normalizeError({code:11000,keyValue:{email:"private@example.com"}});
 assert.equal(err.statusCode,409); assert.equal(err.code,"DUPLICATE_RESOURCE");
 assert.doesNotMatch(err.message,/private@example.com/);
});
test("unexpected errors are sanitized", () => {
 const err=normalizeError(new Error("mongodb://secret"));
 assert.equal(err.statusCode,500); assert.equal(err.code,"INTERNAL_ERROR");
 assert.doesNotMatch(err.message,/secret/);
});
test("malformed JSON maps to a client error", () => {
 const err=normalizeError({type:"entity.parse.failed"});
 assert.equal(err.statusCode,400); assert.equal(err.code,"INVALID_JSON");
});
test("mongoose validation maps to field details", () => {
 const err=normalizeError({name:"ValidationError",errors:{name:{path:"name",message:"Required"}}});
 assert.deepEqual(err.details,[{field:"name",message:"Required"}]);
});
