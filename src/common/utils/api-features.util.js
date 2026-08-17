const { ILike, MoreThanOrEqual, MoreThan, LessThanOrEqual, LessThan } = require("typeorm");


/**
 * Centralized APIFeatures Query Builder Utility for TypeORM / PostgreSQL
 * Supports Filtering, Searching, Sorting, Pagination, and Field Selection safely.
 */
class APIFeatures {
  constructor(queryString = {}) {
    this.queryString = queryString;
    this.where = {};
    this.order = {};
    this.skip = 0;
    this.limit = 10;
    this.page = 1;
    this.select = null;
    this.searchConditions = null;
  }

  /**
   * 1. Filtering: Filters queryString against allowed keys whitelist & bracket operators
   * @param {Array<string>} allowedFilters - Whitelisted filter keys for the module
   */
  filter(allowedFilters = []) {
    const queryObj = {};

    // Parse bracket notation e.g. price[gte]=100 into queryObj[field][operator]
    Object.entries(this.queryString).forEach(([key, value]) => {
      const match = key.match(/^(\w+)\[(gte|gt|lte|lt)\]$/);
      if (match) {
        const [, field, operator] = match;
        if (!queryObj[field]) queryObj[field] = {};
        queryObj[field][operator] = value;
      } else {
        queryObj[key] = value;
      }
    });

    // Exclude reserved query params
    const reservedFields = ["page", "limit", "sortBy", "sortOrder", "sort", "search", "q", "fields"];
    reservedFields.forEach((f) => delete queryObj[f]);

    Object.keys(queryObj).forEach((key) => {
      // If allowedFilters whitelist provided, ignore unauthorized query keys
      if (allowedFilters.length > 0 && !allowedFilters.includes(key)) {
        return;
      }

      const val = queryObj[key];

      // Handle Range Operators (gte, gt, lte, lt)
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        const rangeFilter = {};
        if (val.gte !== undefined) rangeFilter.gte = MoreThanOrEqual(val.gte);
        if (val.gt !== undefined) rangeFilter.gt = MoreThan(val.gt);
        if (val.lte !== undefined) rangeFilter.lte = LessThanOrEqual(val.lte);
        if (val.lt !== undefined) rangeFilter.lt = LessThan(val.lt);

        const conditions = Object.values(rangeFilter);
        if (conditions.length === 1) {
          this.where[key] = conditions[0];
        } else if (conditions.length > 1) {
          this.where[key] = conditions;
        }
      } else {
        // Parse Boolean strings
        let parsedVal = val;
        if (val === "true") parsedVal = true;
        if (val === "false") parsedVal = false;

        // Handle Relation ID Filters cleanly (e.g. doctorId -> { doctor: { id: val } })
        if (key.endsWith("Id") && key.length > 2) {
          const relationName = key.slice(0, -2);
          this.where[relationName] = { id: parsedVal };
        } else {
          this.where[key] = parsedVal;
        }
      }
    });

    return this;
  }

  /**
   * 2. Searching: Performs case-insensitive wildcard ILike search across searchable fields
   * @param {Array<string>} searchableFields - Whitelisted searchable fields (supports relation dot notation e.g. "user.firstName")
   */
  search(searchableFields = []) {
    const searchTerm = (this.queryString.search || this.queryString.q || "").trim();
    if (searchTerm && searchableFields.length > 0) {
      this.searchConditions = searchableFields.map((fieldPath) => {
        if (fieldPath.includes(".")) {
          const parts = fieldPath.split(".");
          if (parts.length === 2) {
            return { [parts[0]]: { [parts[1]]: ILike(`%${searchTerm}%`) } };
          }
          if (parts.length === 3) {
            return { [parts[0]]: { [parts[1]]: { [parts[2]]: ILike(`%${searchTerm}%`) } } };
          }
        }
        return { [fieldPath]: ILike(`%${searchTerm}%`) };
      });
    }

    return this;
  }

  /**
   * 3. Sorting: Validates and sets ordering
   * @param {Array<string>} sortableFields - Whitelisted sort fields
   * @param {Object} defaultSort - Default sort configuration { field: 'createdAt', order: 'DESC' }
   */
  sort(sortableFields = [], defaultSort = { field: "createdAt", order: "DESC" }) {
    let sortBy = this.queryString.sortBy;
    let sortOrder = (this.queryString.sortOrder || "DESC").toUpperCase();

    // Support legacy sort string e.g. ?sort=-createdAt or ?sort=appointmentDateTime
    if (this.queryString.sort && !sortBy) {
      const sortStr = this.queryString.sort.trim();
      if (sortStr.startsWith("-")) {
        sortBy = sortStr.substring(1);
        sortOrder = "DESC";
      } else {
        sortBy = sortStr;
        sortOrder = "ASC";
      }
    }

    if (!sortBy || (sortableFields.length > 0 && !sortableFields.includes(sortBy))) {
      sortBy = defaultSort.field;
      sortOrder = defaultSort.order;
    }

    if (sortOrder !== "ASC" && sortOrder !== "DESC") {
      sortOrder = "DESC";
    }

    this.order[sortBy] = sortOrder;
    return this;
  }

  /**
   * 4. Field Selection: Allows whitelisted fields, strips sensitive fields
   * @param {Array<string>} allowedFields - Whitelisted fields
   */
  limitFields(allowedFields = []) {
    const fieldsParam = this.queryString.fields;
    const sensitiveFields = ["password", "passwordResetToken", "passwordResetExpires"];

    if (fieldsParam) {
      const requestedFields = fieldsParam
        .split(",")
        .map((f) => f.trim())
        .filter((f) => !sensitiveFields.includes(f));

      if (allowedFields.length > 0) {
        this.select = requestedFields.filter((f) => allowedFields.includes(f));
      } else {
        this.select = requestedFields;
      }
    }

    return this;
  }

  /**
   * 5. Pagination: Computes page, limit (max 100), and skip
   * @param {number} defaultLimit - Default limit per page (default: 10)
   * @param {number} maxLimit - Maximum allowed limit (default: 100)
   */
  paginate(defaultLimit = 10, maxLimit = 100) {
    this.page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    this.limit = Math.max(
      1,
      Math.min(maxLimit, parseInt(this.queryString.limit, 10) || defaultLimit)
    );
    this.skip = (this.page - 1) * this.limit;

    return this;
  }

  /**
   * Merges options for TypeORM findAndCount
   * @param {Object} extraWhere - Authorization / security constraints (overrides query filters)
   * @param {Object} relations - Entity relations to load
   */
  getFindOptions(extraWhere = {}, relations = null) {
    let finalWhere;

    if (this.searchConditions && this.searchConditions.length > 0) {
      finalWhere = this.searchConditions.map((searchCond) => ({
        ...this.where,
        ...searchCond,
        ...extraWhere,
      }));
    } else {
      finalWhere = { ...this.where, ...extraWhere };
    }



    const findOptions = {
      where: finalWhere,
      order: this.order,
      skip: this.skip,
      take: this.limit,
    };

    if (this.select && this.select.length > 0) {
      findOptions.select = this.select;
    }

    if (relations) {
      findOptions.relations = relations;
    }

    return findOptions;
  }

  /**
   * Standardized Paginated Response Output
   */
  formatResponse(items = [], total = 0) {
    const totalPages = Math.ceil(total / this.limit) || 1;
    return {
      items,
      pagination: {
        total,
        page: this.page,
        limit: this.limit,
        totalPages,
        hasNextPage: this.page < totalPages,
        hasPreviousPage: this.page > 1,
      },
    };
  }
}

module.exports = APIFeatures;
