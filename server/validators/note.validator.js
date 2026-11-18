const { z } = require('zod');

const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title must be between 1 and 100 characters' })
    .max(100, { message: 'Title must be between 1 and 100 characters' }),
  content: z
    .string()
    .trim()
    .min(1, { message: 'Content must be between 1 and 5000 characters' })
    .max(5000, { message: 'Content must be between 1 and 5000 characters' }),
});

const noteIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid note ID format. Must be a valid UUID' }),
});

module.exports = {
  noteSchema,
  noteIdParamSchema,
};
