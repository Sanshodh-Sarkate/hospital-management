//
const { query } = require("express-validator");

const validateQueryFeatures = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be a positive integer between 1 and 100"),
  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("sortOrder must be ASC or DESC"),
  query("sortBy").optional().isString().trim(),
  query("search").optional().isString().trim(),
  query("fields").optional().isString().trim(),
];

module.exports = {
  validateQueryFeatures,
};
