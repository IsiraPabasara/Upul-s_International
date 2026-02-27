# 2.8 User Interfaces: All

## Overview
Upul's International e-commerce platform provides intuitive and responsive user interfaces for both customers and administrators. All interfaces follow a modern, clean design utilizing Tailwind CSS for consistent styling across the web application. The user interfaces are built with Next.js and React components to ensure optimal performance and user experience.

### GUI Standards & Conventions
- **Design Framework:** Tailwind CSS with custom component library
- **Color Scheme:** Minimalist with black primary actions, gray neutral tones, and red for alerts/errors
- **Typography:** Clear hierarchy with responsive font sizing
- **Input Fields:** Standardized styling with focus states (black border + ring), error states (red borders), and placeholder text guidance
- **Buttons:** Consistent sizing, hover effects, and disabled states
- **Icons:** Lucide React icons for consistent visual communication
- **Validation:** Real-time form validation with clear error messages
- **Responsive Design:** Mobile-first approach with Tailwind breakpoints (sm, md, lg, xl)
- **Standard Elements:** All screens include navigation header, footer, and consistent spacing

---

## 2.8.1 Customer Registration Interface

### Description
The Customer Registration (Signup) page allows new users to create an account in the Upul's International e-commerce platform. This is a critical user interface that serves as the entry point for new customers. The registration process includes email verification through a 4-digit OTP (One-Time Password) system to ensure account security and valid email addresses.

### Key Features & Components

#### **Form Section**
- **First Name Input:** Text field for customer's first name (required)
- **Last Name Input:** Text field for customer's last name (required)
- **Email Address Input:** Email field with validation (required, must be valid email format)
- **Phone Number Input:** Phone number field for contact information (required)
- **Password Input:** Password field with visibility toggle (Eye/EyeOff icons) to allow users to show/hide password (required, minimum length validation)
- **Submit Button:** "Create Account" button that triggers signup mutation and OTP display

#### **Form Validation & Error Handling**
- Real-time error display below each input field
- Server-side error messages displayed in red alert boxes
- Client-side validation using React Hook Form with Zod schema validation
- Success message notification when signup is initiated
- Toast notifications for real-time feedback

#### **OTP Verification Section** (Conditional Display)
The OTP section appears after successful form submission:
- **Four OTP Input Boxes:** Individual input fields for 4-digit code
- **Focus Management:** Auto-focus move between boxes when digit is entered
- **Active Box Highlighting:** Visual indicator showing which box is currently focused
- **Resend Button:** Option to resend OTP with countdown timer (60-second cooldown)
- **Verify Button:** Submits OTP for email verification

#### **Layout & Structure**
```
┌─────────────────────────────────────┐
│     Upul's International Logo        │
├─────────────────────────────────────┤
│      Create Your Account             │
│                                     │
│  First Name: [____________]          │
│  Last Name:  [____________]          │
│  Email:      [____________]          │
│  Phone:      [____________]          │
│  Password:   [____________] [👁]     │
│                                     │
│             [Create Account]         │
│                                     │
│  Already have an account? Login      │
├─────────────────────────────────────┤
│  OTP Verification (After Submission) │
│  [_] [_] [_] [_]                    │
│  [Resend in 60s] [Verify]           │
└─────────────────────────────────────┘
```

### Technical Implementation Details
- **Framework:** Next.js with React Hook Form
- **State Management:** React useState hooks, React Query mutations
- **API Endpoint:** `POST /api/auth/register`
- **Form Type:** Multi-step form (credentials → OTP verification)
- **Password Visibility:** Toggle controlled by Eye/EyeOff icons
- **Timer Management:** Countdown timer for OTP resend functionality
- **Input Focus Management:** useRef for managing OTP input field focus

### User Interaction Flow
1. User fills in registration form (5 fields)
2. User clicks "Create Account" button
3. Form validation occurs
4. If valid, API call is made to register user
5. OTP input section appears
6. User enters 4-digit OTP received via email
7. OTP is verified
8. On success, user is redirected to dashboard or home page
9. On error, error message is displayed with option to resend OTP

### Accessibility & User Guidance
- Clear field labels with required indicators
- Placeholder text providing examples of expected input
- Password strength indicator considerations
- "Remember me" reminder links after successful signup
- Link to login page for existing users
- Clear error messages explaining validation failures

#### **Screen States:**
- **Default State:** Empty form with focus on first name
- **Validation Error State:** Field borders turn red with error message below
- **Server Error State:** Red alert box displays at top with server error message
- **OTP Visible State:** Original form becomes disabled, OTP input section shows
- **Resend Cooldown State:** Resend button disabled with countdown timer
- **Loading State:** Submit button shows loading spinner/disabled state

---

## 2.8.2 Invoice/Checkout Data Filling Interface

### Description
The Checkout page is where customers review their cart, fill in shipping and billing information, apply discount coupons, and select payment methods. This interface is critical for order completion and directly impacts conversion rates. It implements a comprehensive data collection system similar to invoice creation, capturing all necessary customer and order information.

### Key Features & Components

#### **Order Summary Section**
At the right side of the checkout page (on desktop, above on mobile):
- **Cart Items List:** Displays all items with:
  - Product image thumbnail
  - Product name and variant information
  - Unit price
  - Quantity selector
  - Item total (price × quantity)
  - Remove item button (X icon)
- **Subtotal:** Sum of all items before discounts and shipping
- **Discount Display:** Applied coupon code and discount amount deduction
- **Shipping Cost:** Calculated shipping fee (currently $0 in demo)
- **Total Amount:** Final total including all taxes and shipping
- **Order Summary Card:** Expandable/collapsible on mobile with shopping cart icon

#### **Shipping Information Section**
Primary form collection area with the following fields:

**Customer Information:**
- **Email Address:** Optional field for contact email (auto-filled if user logged in)
- **First Name:** Required, minimum 2 characters
- **Last Name:** Required, minimum 2 characters

**Address Information:**
- **Street Address:** Main address line (required, minimum 5 characters)
- **Apartment/Unit:** Optional field for apartment or unit number
- **City:** Required, minimum 2 characters
- **Postal Code:** Required, minimum 3 characters
- **Phone Number:** Required, minimum 9 digits

**Address Management:**
- **Save This Address Checkbox:** Boolean option to save address for future orders
- **Use Different Address Link:** For users with multiple saved addresses
- **Saved Addresses Dropdown:** Selection of previously saved addresses (replaces form)

#### **Coupon/Promo Code Section**
- **Promo Code Input Field:** Text field for coupon code entry
- **Apply Button:** Triggers coupon validation and discount calculation
- **Remove Coupon Button:** Deactivates applied coupon and recalculates totals
- **Coupon Status Message:** 
  - Success message (green) showing discount applied
  - Error message (red) for invalid or expired coupons
- **Real-time Loading State:** Shows loader while validating coupon

#### **Payment Method Selection**
- **COD (Cash on Delivery):** Radio button option
  - Label: "Pay when your order arrives"
  - Selected by default in demo
- **PayHere Integration:** Radio button option
  - Label: "Pay securely with credit/debit card"
  - Shows credit card icon
  - Includes secure payment badge
- **Error State:** Red alert displayed if no payment method selected and user attempts checkout

#### **Action Buttons**
- **Back/Continue Shopping:** Arrow icon with link to return to shop
- **Place Order Button:** Primary action button
  - Disabled state when form is incomplete
  - Shows loading spinner during processing
  - Triggers validation and API call
- **Order Confirmation Message:** Toast notification showing successful order placement

#### **Layout & Visual Structure**

**Desktop Layout (2-Column):**
```
┌─────────────────────┬──────────────────────┐
│  Shipping Info      │  Order Summary       │
│  [Form Fields]      │  Items:              │
│                     │  - Product 1  x2     │
│                     │  - Product 2  x1     │
│                     │                      │
│  Promo Code         │  Subtotal: $XXX      │
│  [Code Input][Btn]  │  Discount: -$XX      │
│                     │  Shipping: $0        │
│  Payment Method     │  ──────────────      │
│  ○ COD              │  Total: $XXX         │
│  ○ PayHere 💳       │                      │
│                     │  [Place Order]       │
│  [Place Order]      │                      │
└─────────────────────┴──────────────────────┘
```

**Mobile Layout (Single Column, Stacked):**
```
┌──────────────────────────────┐
│  Order Summary [↓ Expand]    │
│  ┌──────────────────────────┤
│  │ Items (Collapsed)        │
│  │ Total: $XXX              │
│  └──────────────────────────┘
│                              │
│  Shipping Information        │
│  [Email]                     │
│  [First Name] [Last Name]    │
│  [Address]                   │
│  [City] [Postal]             │
│  [Phone]                     │
│                              │
│  [Save Address] ☐            │
│                              │
│  Promo Code                  │
│  [Code Input] [Apply]        │
│                              │
│  Payment Method              │
│  ○ COD                       │
│  ○ PayHere 💳                │
│                              │
│  [← Back] [Place Order]      │
└──────────────────────────────┘
```

### Technical Implementation Details
- **Framework:** Next.js with React Hook Form + Zod validation
- **State Management:** React hooks (useState, useMemo) for form state and cart data
- **API Endpoints:**
  - `POST /api/orders/create` - Create new order
  - `POST /api/coupons/validate` - Validate coupon code
  - `GET /api/addresses` - Fetch saved addresses
- **Form Validation:** Zod schema with minimum character/digit requirements
- **Cart Integration:** useCart hook for cart item management
- **User Context:** useUser hook for logged-in user data
- **Payment Integration:** PayHere payment gateway integration for online payments
- **Query Client:** React Query for managing async operations and caching

### Input Field Styling
All form inputs use consistent styling:
- **Default State:** Light gray border, white background, black text
- **Focus State:** Black border with subtle focus ring, outline removed
- **Error State:** Red border with matching error text below field
- **Filled State:** User-entered text with standard contrast

### User Interaction Flow
1. User navigates to checkout from cart
2. System loads user information (if logged in) and saved addresses
3. User fills shipping information form
4. Optional: User enters coupon code and clicks "Apply"
5. System validates coupon and updates totals
6. User selects payment method (COD or PayHere)
7. User clicks "Place Order"
8. Form validation occurs (all required fields checked)
9. If valid, order is created via API
10. If payment method is PayHere, user is redirected to payment gateway
11. If COD, order confirmation is displayed
12. Cart is cleared, user is redirected to order tracking page

### Error Handling & User Feedback
- **Validation Errors:** Individual field errors displayed below each input
- **Coupon Errors:** Message explaining why coupon is invalid
- **Payment Method Error:** Alert box if no method selected
- **API Errors:** Toast notification with error message
- **Network Errors:** Retry option provided to user
- **Loading States:** Spinner shown during async operations

### Accessibility Features
- Clear field labels with visual hierarchy
- Placeholder text providing format examples
- Error messages linked to specific form fields
- Save address option clearly labeled
- Payment method options with descriptive text
- All buttons have clear, action-oriented labels
- Form inputs have proper tab order

#### **Screen States:**
- **Empty State:** All fields blank, payment method unselected, place order button disabled
- **Partially Filled:** Some fields completed, totals calculated
- **With Coupon:** Applied coupon displayed with discount deduction
- **Payment Selected:** Payment method selected, button enabled
- **Loading State:** Submit button disabled with spinner, all fields disabled
- **Error State:** One or more fields highlighted in red with error messages
- **Success State:** Order confirmation with order number and next steps

---

## 2.8.3 Customer Login Interface

### Description
The Login page enables existing customers to access their accounts. This interface provides secure credential submission with email/password authentication and optional "Remember Me" functionality for enhanced user convenience without compromising security.

### Key Components
- **Email Input Field:** Email address with validation
- **Password Input Field:** Hidden password with visibility toggle
- **Remember Me Checkbox:** Stores email in localStorage for future visits
- **Login Button:** Submits credentials for authentication
- **Error Display:** Shows server-side authentication errors
- **"Forgot Password" Link:** Navigation to password recovery
- **"Create Account" Link:** Navigation to signup page
- **Toast Notifications:** Real-time feedback on login success/failure

### Technical Details
- **API Endpoint:** `POST /api/auth/login-user`
- **State Management:** useForm hook with validation
- **Data Persistence:** localStorage for "Remember Me" feature
- **Cache Sync:** Cart and wishlist synchronization on successful login

---

## 2.8.4 Product Display & Shopping Interface

### Description
The Product page displays detailed product information with images, pricing, variants, and purchasing options. This interface includes color/size selection and add-to-cart functionality.

### Key Components
- **Product Image Gallery:** Main image with thumbnail carousel
- **Product Information Section:**
  - Product name and rating
  - Price (with discount calculation if applicable)
  - Stock status indicator
- **Variant Selection:** Color and size options with visual selection
- **Quantity Selector:** Plus/minus buttons to select quantity
- **Add to Cart Button:** Primary action button
- **Add to Wishlist Button:** Heart icon toggle
- **Product Description & Details:** Tabs for specifications, reviews, shipping info

---

## 2.8.5 Shopping Cart Summary

### Description
The Cart page displays all added items with options to modify quantities, remove items, apply discounts, and proceed to checkout.

### Key Components
- **Cart Items List:** Each item shows image, name, price, quantity, and total
- **Quantity Adjustment:** Plus/minus controls with update functionality
- **Remove Item Buttons:** Delete items from cart
- **Subtotal Calculation:** Running total of all items
- **Empty Cart Message:** Prompts user to continue shopping
- **Proceed to Checkout Button:** Navigates to checkout page
- **Continue Shopping Link:** Returns to product browsing

---

## 2.8.6 User Profile & Account Management

### Description
The Profile/Dashboard page allows customers to manage their account information, view order history, and saved addresses.

### Key Components
- **Account Information Section:**
  - Profile picture/avatar
  - Name and email display
  - Edit profile button
- **Saved Addresses List:** View, edit, and delete saved addresses
- **Order History:** Recent orders with status indicators
  - Order number
  - Order date
  - Total amount
  - Status (Processing, Shipped, Delivered)
  - Track Order button
- **Wishlist Access:** Quick link to wishlist items
- **Settings Links:** Notification preferences, security settings
- **Logout Button:** Secure account sign-out

---

## 2.8.7 Order Tracking Interface

### Description
The Track Order page allows customers to monitor their order status and view shipment details.

### Key Components
- **Order Number Input/Display:** View specific order details
- **Order Status Timeline:** Visual progress indicator showing:
  - Order Confirmed
  - Payment Processed
  - Order Dispatched
  - Out for Delivery
  - Delivered
- **Estimated Delivery Date:** Shows expected delivery timeframe
- **Shipment Tracking Number:** Carrier tracking link if applicable
- **Order Items List:** Items included in the shipment
- **Contact Support Button:** Link to customer service

---

## 2.8.8 Admin Dashboard Interface

### Description
The Admin Dashboard provides administrators with system overview and access to all management functions.

### Key Components
- **Navigation Sidebar:** Links to major admin functions:
  - Dashboard (Overview/Analytics)
  - Products Management
  - Orders Management
  - Users Management
  - Categories Management
  - Finance/Reports
- **Dashboard Overview Cards:**
  - Total Revenue (Today/Month/Year)
  - Total Orders
  - Total Customers
  - Total Products
- **Charts & Analytics:**
  - Sales trend graphs
  - Top products visualization
  - Customer acquisition metrics
- **Recent Orders Table:** Quick view of latest orders
- **Quick Actions:** Links to common tasks
- **Admin Profile:** Top-right corner with sign-out option

---

## GUI Design Standards & Cross-Cutting Concerns

### Color Palette
- **Primary Action:** Black (#000000) - for main buttons and important CTAs
- **Borders & Input Borders:** Gray (#D1D5DB, #9CA3AF) - neutral form styling
- **Error/Alert:** Red (#EF4444) - validation errors and negative actions
- **Success:** Green (#10B981) - confirmation messages
- **Disabled State:** Light Gray (#E5E7EB) - inactive elements
- **Text:** Dark Gray (#1F2937) - primary text, light gray for secondary

### Button Standards
All buttons follow consistent patterns:
- **Primary Buttons:** Black background, white text, hover darkening
- **Secondary Buttons:** White background, black border, transparent fill
- **Disabled Buttons:** Light gray background, disabled cursor
- **Icon Buttons:** Transparent background, icon color changes on hover
- **Loading State:** Shows spinner, disabled/non-clickable

### Input Field Standards
- **Default:** White background, light gray border
- **Focus:** Black border with subtle inner shadow
- **Error:** Red border, error text below field
- **Filled:** Dark text on white background
- **Disabled:** Light gray background, disabled cursor

### Toast Notifications
- **Success:** Green background with checkmark icon
- **Error:** Red background with X icon
- **Info:** Blue background with info icon
- **Duration:** 3-5 seconds auto-dismiss
- **Position:** Top-right corner of viewport

### Form Validation Approach
- **Real-time Validation:** Errors displayed as user leaves field
- **Submit Validation:** Additional check on form submission
- **Server Validation:** Errors returned from API included in error display
- **Error Message Format:** Clear, actionable messages (e.g., "Email must be valid" not "Invalid Input")

### Responsive Design Breakpoints
- **Mobile:** < 768px - Single column layout, stacked components
- **Tablet:** 768px - 1024px - Flexible grid, 2-column on larger tablets
- **Desktop:** > 1024px - Full multi-column layouts, side-by-side sections

### Accessibility Standards
- **WCAG 2.1 Level AA Compliance** (Target)
- Proper heading hierarchy (H1, H2, H3)
- Alt text for all images
- Semantic HTML elements
- Keyboard navigation support
- Focus indicators visible on all interactive elements
- Sufficient color contrast (4.5:1 minimum)
- Form labels properly associated with inputs
- Error messages linked to form fields

### Common Elements Across All Screens

#### **Header/Navigation**
- Logo on far left linking to home
- Search bar (where applicable)
- Shopping cart icon with item count (user-facing)
- User menu/profile (top-right)
- Mobile hamburger menu (collapsed on small screens)

#### **Footer**
- Company information and links
- Customer support contact
- Return and shipping policies
- Social media links
- Newsletter signup
- Payment method icons

#### **Loading States**
- Full-page loader: Centered spinner with "Loading..." text
- Button loader: Inline spinner on button
- Skeleton screens: Gray placeholder shapes while content loads

#### **Error Pages**
- **404 Page:** Not found error with home/back buttons
- **Offline Page:** Network error message with retry button
- **Generic Error:** Server error with error code and support contact

---

## User Interface Flow Diagrams

### Customer Journey - Registration to Order
```
START
  ↓
[Signup/Login] → [Browse Products] → [View Product Details]
  ↓                                      ↓
[Create Account] ← ← ← ← ← ← ← ← ← ← [Add to Cart]
  ↓                                      ↓
[Email Verification] ← ← ← [Repeat Product Browsing]
  ↓                          ↓
[Dashboard] ← ← ← ← ← → [View Cart]
  ↓                          ↓
  └──────→ [Checkout] ←─────┘
              ↓
        [Fill Shipping Info]
              ↓
        [Select Payment Method]
              ↓
        [Place Order]
              ↓
        [Order Confirmation]
              ↓
        [Track Order via Profile]
              ↓
            END
```

### Admin Workflow - Product Management
```
START
  ↓
[Admin Dashboard] → [Products Section]
  ↓
[View Products] → [Edit/Delete/Add]
  ↓
[Add New Product] → [Fill Product Details]
  ↓
[Upload Images] → [Set Categories & Variants]
  ↓
[Set Pricing] → [Configure Inventory]
  ↓
[Publish Product] → [Confirmation]
  ↓
[Dashboard] ← ← [View Published Product]
  ↓
END
```

---

## Notes for Implementation
1. All forms should include proper ARIA labels for screen readers
2. Password fields should have strength indicator when applicable
3. All async operations should show appropriate loading states
4. Error messages should be specific and actionable
5. All input validation should provide real-time feedback
6. Mobile responsiveness should be tested on actual devices
7. Performance optimization: lazy load images, code splitting by route
8. Implement proper error boundaries for graceful error handling

