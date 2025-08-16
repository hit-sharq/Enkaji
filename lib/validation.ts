import { z } from "zod"

// User validation schemas
export const userRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
})

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? Number.parseFloat(val) : val))
    .pipe(z.number().positive("Price must be positive")),
  inventory: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? Number.parseInt(val, 10) : val))
    .pipe(z.number().int().min(0, "Inventory cannot be negative")),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
})

// Order validation schemas
export const orderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "Valid zip code is required"),
    country: z.string().min(2, "Country is required"),
  }),
  paymentMethod: z.enum(["STRIPE", "MPESA", "CASH_ON_DELIVERY"]),
})

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

// Newsletter validation
export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// Bulk order validation
export const bulkOrderSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().min(10, "Minimum bulk order is 10 items"),
  message: z.string().optional(),
})

// Artisan registration validation
export const artisanRegistrationSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  location: z.string().min(3, "Location is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  experience: z.number().int().min(0, "Experience cannot be negative"),
})

// Seller registration validation
export const sellerRegistrationSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters"),
  businessType: z.string().min(3, "Business type is required"),
  location: z.string().min(3, "Location is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
})
