# 🚀 ESLint Plugin to Auto-Sort MUI sx Properties

<p align="center">
  <img width="576" height="384" src="./assets/demo.gif" alt="Demo GIF showing sorting sx properties automatically">
</p>

An ESLint plugin that automatically sorts **Material-UI (MUI) `sx` style properties** for consistent, clean, and maintainable code. Supports JavaScript and TypeScript projects.

<p align="center">
  <a href="https://www.npmjs.com/package/eslint-plugin-mui-sx-order">
    <img src="https://img.shields.io/npm/v/eslint-plugin-mui-sx-order" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/eslint-plugin-mui-sx-order">
    <img src="https://img.shields.io/npm/dm/eslint-plugin-mui-sx-order" alt="npm downloads" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/npm/l/eslint-plugin-mui-sx-order" alt="license" />
  </a>
  <a href="https://github.com/sytnikovzp/eslint-plugin-mui-sx-order/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/sytnikovzp/eslint-plugin-mui-sx-order/release.yml?branch=main" alt="CI" />
  </a>
</p>

---

## 🌟 Why Use This Plugin?

Maintaining a **consistent and logical order of MUI `sx` style properties** is critical for:

- ✅ Code readability
- ✅ Easier debugging and maintenance
- ✅ Team-wide styling best practices

This plugin:

- 🔥 Automatically sorts `sx` properties in your React components
- 📦 Supports nested selectors (`&:hover`) and responsive breakpoints (`xs`, `sm`, `md`)
- ⚡ Works with ESLint and Prettier for a seamless developer experience

---

## ✨ Key Features

- 📦 **Automatic sorting** of all `sx` properties, even nested objects
- 🔥 Supports pseudo-classes, nested selectors, and media query keys
- 🛠 Fully compatible with `eslint --fix`
- 🚀 Supports JavaScript and TypeScript projects out of the box
- ⚡ Zero dependencies → ultra-fast linting

---

## 🔥 Why not just use Prettier?

Prettier is great for formatting, but it doesn’t understand the logical groups of MUI sx properties.
This plugin enforces a best-practice order:

1. **Positioning**: `position`, `top`, `right`, `zIndex`, and others.
2. **Display & Layout**: `display`, `boxSizing`, `visibility`, and others.
3. **Flexbox**: `flex`, `flexBasis`, `flexDirection`, and others.
4. **Grid**: `grid`, `gridArea`, `gridTemplate`, and others.
5. **Spacing & Box Model**: `width`, `minWidth`, `maxWidth`, and others.
6. **Typography**: `font`, `fontFamily`, `fontSize`, and others.
7. **Background & Effects**: `background`, `backgroundColor`, `boxShadow`, and others.
8. **Transitions & Animations**: `transition`, `animation`, `transform`, and others.

---

## 📦 Install

Add the plugin to your project as a dev dependency:

```bash
npm i -D eslint-plugin-mui-sx-order
```

or with Yarn:

```bash
yarn add -D eslint-plugin-mui-sx-order
```

---

## ⚙️ Configuration Example

### For `.eslintrc.js` (CommonJS format):

```js
module.exports = {
  plugins: ['mui-sx-order'],
  rules: {
    'mui-sx-order/sort-sx-properties': 'warn',
  },
};
```

### For `.eslintrc` or `.eslintrc.json` (JSON format):

```json
{
  "plugins": ["mui-sx-order"],
  "rules": {
    "mui-sx-order/sort-sx-properties": "warn"
  }
}
```

### For `.eslint.config.js` (ES module format):

```js
import muiSxOrder from 'eslint-plugin-mui-sx-order';

export default {
  plugins: {
    'mui-sx-order': muiSxOrder,
  },
  rules: {
    'mui-sx-order/sort-sx-properties': 'warn',
  },
};
```

---

## 🛠 Usage & Auto-fix

You can automatically fix the property order using:

```bash
npx eslint --fix .
```

This will sort all sx properties in your project.

---

## 📢 Perfect for Teams & Open Source Projects

Ensure a **consistent style guide** for all MUI projects in your team.
Great for **large codebases** where property order matters for readability.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
