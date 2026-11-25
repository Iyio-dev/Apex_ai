import AppError from "./AppError.js";

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const getPaginationOptions = (options = {}) => {
  const offset = Number(options.offset ?? 0);
  const limit = Number(options.limit ?? DEFAULT_LIMIT);

  if (
    !Number.isSafeInteger(offset) ||
    !Number.isSafeInteger(limit) ||
    offset < 0 ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    throw new AppError(
      `Invalid pagination options. Offset must be a non-negative integer, and limit must be an integer between 1 and ${MAX_LIMIT}.`,
      400,
    );
  }

  return { offset, limit };
};
