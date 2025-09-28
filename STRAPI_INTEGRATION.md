# Strapi CMS Integration Guide

This document outlines the integration points for connecting this photography website to Strapi CMS.

## Overview

The website is designed to work with Strapi CMS for dynamic content management. All placeholder content has been marked with integration points and can be easily replaced with dynamic content from Strapi.

## Content Types

### 1. Portfolio Items (`/api/portfolio-items`)

**Fields:**
- `title` (string) - Image title
- `image` (media) - Main portfolio image
- `category` (enum) - winter, spring, summer, fall, ocean
- `exif_data` (json) - Camera settings and metadata
- `order` (number) - Display order
- `featured` (boolean) - Featured on homepage
- `description` (text) - Optional description

**Integration Points:**
- `index.html` - Portfolio grid section
- Replace static portfolio items with dynamic content
- Implement category filtering with Strapi data

### 2. Blog Posts (`/api/posts`)

**Fields:**
- `title` (string) - Post title
- `slug` (string) - URL slug
- `excerpt` (text) - Short description
- `content` (richtext) - Full post content
- `featured_image` (media) - Post thumbnail
- `publishedAt` (datetime) - Publication date
- `category` (relation) - Post category
- `tags` (relation) - Post tags
- `author` (relation) - Post author

**Integration Points:**
- `index.html` - Latest posts section
- `blog.html` - Blog grid
- `blog-post.html` - Individual post pages

### 3. About Content (`/api/about`)

**Fields:**
- `portrait_image` (media) - Profile photo
- `bio_blocks` (component) - Structured bio content
- `equipment_list` (json) - Camera gear
- `philosophy` (text) - Photographer's philosophy
- `location` (string) - Base location

**Integration Points:**
- `index.html` - About section
- `about.html` - Full about page

### 4. Contact Submissions (`/api/contact-submissions`)

**Fields:**
- `name` (string) - Contact name
- `email` (email) - Contact email
- `subject` (enum) - Inquiry type
- `message` (text) - Message content
- `submittedAt` (datetime) - Submission timestamp

**Integration Points:**
- `index.html` - Contact form
- `contact.html` - Contact form

### 5. Shop Products (`/api/products`)

**Fields:**
- `title` (string) - Product name
- `description` (text) - Product description
- `images` (media) - Product photos
- `price` (number) - Base price
- `sizes` (json) - Available sizes and prices
- `category` (enum) - prints, digital, collections
- `status` (enum) - active, coming_soon, sold_out
- `featured` (boolean) - Featured product

**Integration Points:**
- `shop.html` - Product grid
- Implement filtering and sorting

### 6. Site Settings (`/api/site-settings`)

**Fields:**
- `site_title` (string) - Site title
- `tagline` (string) - Site tagline
- `hero_image` (media) - Homepage hero
- `contact_email` (email) - Contact email
- `social_links` (json) - Social media links

**Integration Points:**
- Global site configuration
- Header/footer content

## Implementation Steps

### 1. Setup Strapi Backend

```bash
# Install Strapi
npx create-strapi-app@latest photography-cms

# Create content types as defined above
# Configure API permissions
# Set up media library
```

### 2. Update Frontend Code

**Replace static content with dynamic:**

```javascript
// Example: Fetch portfolio items
async function loadPortfolioItems() {
  try {
    const response = await fetch(`${CMS_BASE}/api/portfolio-items?_sort=order:ASC`);
    const data = await response.json();
    
    // Replace static grid with dynamic content
    const portfolioGrid = document.getElementById('portfolio-grid');
    portfolioGrid.innerHTML = data.data.map(item => 
      createPortfolioItem(item)
    ).join('');
  } catch (error) {
    console.error('Failed to load portfolio items:', error);
  }
}
```

### 3. Add Loading States

```javascript
// Show loading skeletons while fetching
function showLoadingState() {
  document.querySelector('.loading-skeleton').style.display = 'block';
}

function hideLoadingState() {
  document.querySelector('.loading-skeleton').style.display = 'none';
}
```

### 4. Implement Error Handling

```javascript
// Handle API errors gracefully
function handleApiError(error) {
  console.error('API Error:', error);
  // Show fallback content or error message
}
```

### 5. Add Caching

```javascript
// Cache API responses for better performance
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);
  return data;
}
```

## File Locations

**Integration Points:**
- `index.html` - Lines 278-279, 515-516, 562-563, 600-601
- `blog.html` - Lines 174-175
- `about.html` - Lines 56-57
- `contact.html` - Lines 56-57
- `shop.html` - Lines 59-60

**JavaScript Files:**
- `src/js/cms.js` - Main CMS integration logic
- `src/js/lazy-observer.js` - Animation system (already implemented)

## Environment Configuration

```javascript
// Update CMS endpoint in all HTML files
window.CMS_BASE = "http://your-strapi-domain:1337";

// Or use environment variables
window.CMS_BASE = process.env.STRAPI_URL || "http://localhost:1337";
```

## Testing

1. Set up local Strapi instance
2. Create test content for all content types
3. Update CMS_BASE URL
4. Test all integration points
5. Verify animations work with dynamic content

## Performance Considerations

- Implement lazy loading for images
- Use image optimization (WebP, responsive images)
- Cache API responses
- Minimize API calls with pagination
- Use Content-Visibility for large lists

## Security

- Set proper API permissions in Strapi
- Validate all form inputs
- Use HTTPS in production
- Implement rate limiting for contact forms
- Sanitize user-generated content
