const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().trim().email({ message: 'Must be a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Must be a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

module.exports = {
  signupSchema,
  loginSchema,
};
