# Deep Linking

Deep links allow users to open specific screens in the Enkaji app from emails, notifications, or web links.

## Supported Link Types

### Web → Mobile

| Link Pattern | Screen | Example |
|---|---|---|
| `https://enkaji.vercel.app/product/:id` | Product detail | `.../product/abc123` |
| `https://enkaji.vercel.app/category/:slug` | Search filtered by category | `.../category/electronics` |
| `https://enkaji.vercel.app/seller/:id` | Seller dashboard | `.../seller/456` |
| `https://enkaji.vercel.app/messages/:threadId` | Chat thread | `.../messages/789` |
| `https://enkaji.vercel.app/checkout` | Checkout screen | `.../checkout` |
| `https://enkaji.vercel.app/?product=:id` | Quick product link | `.../?product=abc123` |

### Custom Scheme (enkaji://)

Same patterns using `enkaji://` scheme:
- `enkaji://product/abc123`
- `enkaji://category/electronics`
- `enkaji://seller/456`
- `enkaji://messages/789`

## Usage

### In Emails

```html
<a href="https://enkaji.vercel.app/product/{{product_id}}">
  View Product
</a>
```

When clicked on mobile, it opens the app directly to that product.

### In Notifications

Push notification payload should include:
```json
{
  "type": "product",
  "title": "New product available",
  "data": {
    "productId": "abc123"
  }
}
```

Or use `url` field:
```json
{
  "title": "Your order is ready",
  "data": {
    "url": "/orders/ORD-001"
  }
}
```

## Configuration

### Mobile (app.json)

- `scheme: "enkaji"` — defines `enkaji://` protocol
- `android.intentFilters` — handles HTTPS links on Android
- `ios.associatedDomains` — enables Universal Links on iOS

### Web (next.config.js)

Standard Next.js routes file-based routing automatically handles deep links.

## Navigation After Deep Link

The app navigates automatically based on link pattern:

- `/product/:id` → `app/product/[id].tsx`
- `/category/:slug` → `app/(tabs)/search.tsx` with `category` param
- `/seller/:id` → `app/seller/[id].tsx`
- `/messages/:threadId` → `app/messages/[id].tsx`
- `/checkout` → `app/checkout.tsx`

## Fallback

If the app is not installed, web links open the Enkaji website (PWA). Users can then install the app from the website.
