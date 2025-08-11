# Enkaji Trade Kenya

A comprehensive e-commerce platform connecting Kenyan artisans, sellers, and buyers. Enkaji Trade Kenya empowers local craftspeople and businesses to showcase their products to a wider market while providing customers with authentic, high-quality Kenyan goods.

## 🌟 Features

### For Buyers
- **Product Discovery**: Browse thousands of authentic Kenyan products
- **Advanced Search & Filtering**: Find products by category, price, location, and more
- **Secure Shopping Cart**: Add items and checkout securely
- **Order Management**: Track your orders from purchase to delivery
- **Favorites**: Save products for later purchase
- **Bulk Orders**: Request quotes for large quantity purchases
- **Request for Quotation (RFQ)**: Get custom quotes for specific requirements

### For Sellers & Artisans
- **Seller Dashboard**: Manage products, orders, and business analytics
- **Product Management**: Easy product listing with image uploads
- **Order Processing**: Streamlined order fulfillment workflow
- **Business Verification**: Get verified seller status for increased trust
- **Performance Analytics**: Track sales, views, and customer engagement

### For Administrators
- **Admin Dashboard**: Comprehensive platform management
- **User Management**: Manage buyers, sellers, and artisans
- **Product Moderation**: Review and approve product listings
- **Order Oversight**: Monitor platform-wide order activity
- **Content Management**: Manage blog posts and platform content
- **Analytics & Reporting**: Platform performance insights

## 🛠 Technology Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Cloudinary for image management
- **Deployment**: Vercel
- **Email**: Resend for transactional emails
- **Payments**: Integration ready for M-Pesa and other payment methods

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication
- Cloudinary account for image storage

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/enkaji-trade-kenya.git
   cd enkaji-trade-kenya
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/enkaji_db"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Admin Configuration
   ADMIN_IDS=user_clerk_id_1,user_clerk_id_2
   
   # Email (Optional)
   RESEND_API_KEY=re_...
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

5. **Seed the database (optional)**
   \`\`\`bash
   npx prisma db seed
   \`\`\`

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
enkaji-trade-kenya/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   └── ...                # Other pages
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ...               # Feature-specific components
├── lib/                  # Utility functions and configurations
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── styles/               # Global styles
\`\`\`

## 🔧 Key Features Implementation

### Authentication & Authorization
- Clerk integration for secure user authentication
- Role-based access control (Admin, Seller, Artisan, Buyer)
- Protected routes with middleware

### Database Design
- Comprehensive schema covering users, products, orders, categories
- Optimized for e-commerce operations
- Support for complex relationships and queries

### File Upload & Management
- Cloudinary integration for image storage
- Optimized image delivery and transformations
- Secure upload handling

### Responsive Design
- Mobile-first approach
- Tailwind CSS for consistent styling
- shadcn/ui for accessible components

## 🌍 Kenyan Market Focus

### Local Categories
- **Maasai Crafts**: Traditional beadwork, jewelry, and artifacts
- **Kikuyu Products**: Agricultural products and crafts
- **Coastal Crafts**: Swahili-inspired art and decorations
- **Modern Kenyan**: Contemporary designs with local influence

### Regional Support
- Multi-county seller registration
- Location-based product filtering
- Local delivery options
- Support for local payment methods

## 🤝 Contributing

We welcome contributions to Enkaji Trade Kenya! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Kenyan artisans and craftspeople who inspire this platform
- The open-source community for the amazing tools and libraries
- Contributors who help make this platform better

## 📞 Support

For support, email support@enkajitradeKenya.com or join our community discussions.

---

**Enkaji Trade Kenya** - Connecting Kenya's finest artisans with the world 🇰🇪
