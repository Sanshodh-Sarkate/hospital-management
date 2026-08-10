const generateEmployeeId = (prefix, lastEmployeeId) => {
  if (!lastEmployeeId) return `${prefix}-000001`;

  const lastNumber = parseInt(lastEmployeeId.replace(`${prefix}-`, ""), 10);
  const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;

  return `${prefix}-${String(nextNumber).padStart(6, "0")}`;
};

module.exports = generateEmployeeId;
module.exports.generateEmployeeId = generateEmployeeId;
module.exports.generatEmployeeId = generateEmployeeId;