const sanitizeString = (value) =>
  value.replace(/<[^>]*>/g, "").trim();

const deepSanitize = (input) => {
  if (typeof input === "string") return sanitizeString(input);
  if (Array.isArray(input)) return input.map(deepSanitize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input).map(([k, v]) => [k, deepSanitize(v)]));
  }
  return input;
};

export const sanitizeBody = (req, res, next) => {
  if (req.body) req.body = deepSanitize(req.body);
  next();
};
