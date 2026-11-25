import { getPaginationOptions } from "./pagination.js";

export const paginateQuery = async ({
  model,
  filter = {},
  options = {},
  sort = { createdAt: -1 },
}) => {
  const { offset, limit } = getPaginationOptions(options);

  const [results, total] = await Promise.all([
    model.find(filter).sort(sort).skip(offset).limit(limit).exec(),
    model.countDocuments(filter).exec(),
  ]);

  return {
    results,
    pagination: {
      total,
      offset,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: offset + results.length < total,
      hasPrevPage: offset > 0 && total > 0,
    },
  };
};
