# ESLint Plugin for MUI sx Key Order

A simple ESLint plugin that ensures Material-UI `sx` prop keys are sorted according to best practices, improving code consistency and maintainability.

<p align="center">
  <img src="https://img.shields.io/github/last-commit/sytnikovzp/eslint-plugin-mui-sx-order" alt="Last Commit">
</p>

## Installation

To install this plugin, run the following command in your project:

```bash
npm i -D eslint-plugin-mui-sx-order
```

## Usage

### ESLint Configuration

To enable the plugin, add it to your ESLint configuration file:

```json
{
  "extends": ["plugin:mui-sx-order/recommended"],
  "plugins": ["mui-sx-order"]
}
```

### Rule Configuration

By default, the plugin will sort your `sx` prop keys according to the best practices for Material-UI. The rule can be configured as follows:

```json
{
  "rules": {
    "mui-sx-order/sort-sx-keys": "warn"
  }
}
```

### Example

#### Incorrect Code (not sorted)

```jsx
<Box
  sx={{
    width: 300,
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
  }}
/>
```

#### Correct Code (sorted)

```jsx
<Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    width: 300,
    padding: '20px',
  }}
/>
```

## Rule Details

This rule sorts the `sx` properties according to predefined categories, which include:

- **Positioning** (e.g., `position`, `top`, `right`, `zIndex`)
- **Display & Layout** (e.g., `display`, `boxSizing`, `visibility`, `overflow`)
- **Flexbox** (e.g., `flex`, `flexDirection`, `justifyContent`, `alignItems`)
- **Grid** (e.g., `grid`, `gridTemplateColumns`, `gridRow`, `gridColumn`)
- **Spacing & Box Model** (e.g., `width`, `height`, `margin`, `padding`)
- **Typography** (e.g., `fontSize`, `lineHeight`, `fontWeight`, `color`)
- **Background & Effects** (e.g., `background`, `boxShadow`, `opacity`)
- **Responsive Design** (e.g., `xs`, `sm`, `md`, `lg`)

The plugin also ensures that media queries (`xs`, `sm`, `md`) and pseudo-classes (e.g., `&:hover`) are placed at the end of the object.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<p align="center">© 2025 Alexandr Sytnikov</p>
