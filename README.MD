# ESLint Plugin for Sorting MUI `sx` Properties

This ESLint plugin helps maintain the correct order of properties in MUI (Material-UI) `sx` objects according to best practices. The plugin not only detects incorrect property order but also automatically fixes it using the `--fix` flag.

<p align="center">
  <img src="https://img.shields.io/github/last-commit/sytnikovzp/eslint-plugin-mui-sx-order" alt="Last Commit">
</p>

## How the Sorting Works

The rule sorts both **top-level** properties and **nested** style objects. For example, if an object has nested styles like `&:before`, they will be sorted according to the same order as the top-level properties.

The sorting follows this order:

1. **Positioning**: `position`, `top`, `right`, `zIndex`, and others.
2. **Display & Layout**: `display`, `boxSizing`, `visibility`, and others.
3. **Flexbox**: `flex`, `flexBasis`, `flexDirection`, and others.
4. **Grid**: `grid`, `gridArea`, `gridTemplate`, and others.
5. **Spacing & Box Model**: `width`, `minWidth`, `maxWidth`, and others.
6. **Typography**: `font`, `fontFamily`, `fontSize`, and others.
7. **Background & Effects**: `background`, `backgroundColor`, `boxShadow`, and others.
8. **Transitions & Animations**: `transition`, `animation`, `transform`, and others.

Each key is sorted according to the preferred order. Nested objects are also sorted recursively.
The plugin also ensures that media queries (`xs`, `sm`, `md`) and pseudo-classes (e.g., `&:hover`) are placed at the end of the object.

## Example

Let's say you have the following style object with an incorrect property order:

#### Before Sorting (Incorrect Order):

```jsx
<Box
  sx={{
    '&:before': {
      display: 'block',
      bgcolor: 'background.paper',
      content: '""',
      position: 'absolute',
      right: { sm: 25, xs: 22 },
      top: 0,
      transform: 'translateY(-50%) rotate(45deg)',
      height: 10,
      width: 10,
      zIndex: 0,
    },
    width: 300,
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
  }}
/>
```

As you can see, the properties in the object do not follow the recommended order.

#### After Sorting (Correct Order):

```jsx
<Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    width: 300,
    padding: '20px',
    '&:before': {
      position: 'absolute',
      top: 0,
      right: { xs: 22, sm: 25 },
      zIndex: 0,
      display: 'block',
      width: 10,
      height: 10,
      bgcolor: 'background.paper',
      content: '""',
      transform: 'translateY(-50%) rotate(45deg)',
    },
  }}
/>
```

The plugin automatically sorts the properties, following best practices for MUI `sx` objects.

## How to Use

### 1. Install the plugin to your project:

```bash
npm i -D eslint-plugin-mui-sx-order
```

### 2. Configuration

#### For `.eslintrc.js` (CommonJS format):

If you're using an ESLint configuration file in JavaScript (`.eslintrc.js`), you should configure the plugin as follows:

```javascript
module.exports = {
  plugins: ['mui-sx-order'],
  rules: {
    'mui-sx-order/sort-sx-properties': 'warn',
  },
};
```

#### For `.eslintrc` or `.eslintrc.json` (JSON format):

If you're using a `.eslintrc` or `.eslintrc.json` configuration, the configuration will look like this:

```json
{
  "plugins": ["mui-sx-order"],
  "rules": {
    "mui-sx-order/sort-sx-properties": "warn"
  }
}
```

#### For `.eslint.config.js` (ES module format):

If you're using an ESLint configuration file with ES module syntax (`.eslint.config.js`), the configuration will look like this:

```javascript
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

### 3. Automatically Fix Property Order

To automatically fix the property order in your code, you can run:

```bash
npx eslint --fix .
```

This will automatically fix the property order in all files that ESLint checks. You can also run it on specific files or directories, for example:

```bash
npx eslint --fix src/components/MyComponent.jsx
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<p align="center">© 2025 <a href="https://github.com/sytnikovzp">Alexandr Sytnikov</a></p>
