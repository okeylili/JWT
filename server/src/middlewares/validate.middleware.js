export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body", errors: parsed.error.flatten() });
  }
  req.validatedBody = parsed.data;
  return next();
};
