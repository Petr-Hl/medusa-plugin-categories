# Product categories with thumbnails

Medusa admin UI modul with category thumbnail support, using metadata for store the information about thumbnail.

[Medusa Website](https://medusajs.com/) | [Medusa Repository](https://github.com/medusajs/medusa)

## Features

- Product category thumbnail
- Easy UI management of all product categories

---

## Prerequisites

- [Medusa backend](https://docs.medusajs.com/development/backend/install)

---

## How to Install

1\. Run the following command in the directory of the Medusa backend:

```bash
yarn add medusa-plugin-categories
```

2\. In `medusa-config.js` add the following configuration at the end of the `plugins` array:

```js
const plugins = [
  // ...
  {
    resolve: `medusa-plugin-categories`,
    options: {
      enableUI: true,
    },
  },
];
```

---

## Screenshots

![image](https://github.com/user-attachments/assets/498f655d-a7eb-4862-bfda-45bfd8db8a66)
![image](https://github.com/user-attachments/assets/4a1092b2-a597-4f71-9c86-7f2165f0cf5c)

---

## Test the Plugin

Run the following command in the directory of the Medusa backend to run the backend:

```bash
yarn dev
```

In StoreFront project you can use the thumbnail by

```bash
category.metadata?.thumbnailImageUrl
```

Example:

```bash
import { getCategoriesList } from "@lib/data"

const { product_categories } = await getCategoriesList()

const thumbnails = productCategories.map((category) => (
    <img
      src={decodeURI((category.metadata?.thumbnailImageUrl as string) || "")}
      alt={category.name}
    />
  ))
```

---

## Homepage

- [Product categories with thumbnail](https://github.com/Petr-Hl/medusa-plugin-categories)
