# jQuery Affix Plugin

The **jQuery Affix Plugin** allows you to create sticky elements on your webpage with configurable offsets and optional
breakpoints. It is lightweight, easy to use, and supports multiple affix elements.

---

## Features

- Sticky positioning using CSS `position: sticky`.
- Configurable `offsetTop` to adjust the sticky position.
- Optional breakpoints to activate the sticky functionality only at specific screen widths.
- Automatically handles multiple affix elements with proper stacking (`z-index`) and offsets.
- Compatible with modern web browsers.

---

## Installation

1. Include jQuery in your project (if not already included):

```html
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
```

2. Add the `affix` plugin script to your project:

```html
<script src="dist/jquery-affix.min.js"></script>
```

---

## Usage

To use the affix plugin, call the `.affix()` method on the desired element.
You can pass optional configurations (as described below).

### Basic Example

```html

<div id="my-sticky-element">
    I am a sticky element!
</div>

<script>
    $(document).ready(function () {
        $('#my-sticky-element').affix();
    });
</script>
```

In this example, the `#my-sticky-element` will stick to the top of its container when you scroll past it.

---

## Configuration Options

The plugin provides the following configuration options:

| Option          | Type                 | Default | Description                                                                    |
|-----------------|----------------------|---------|--------------------------------------------------------------------------------|
| `offsetTop`     | `number` (pixels)    | `0`     | Additional spacing to apply at the top before the sticky styling takes effect. |
| `breakpoint`    | `number` or `string` | `null`  | Minimum screen width (in pixels or predefined breakpoint) to enable sticky.    |

### Predefined Breakpoints:

You can use the following values for the `breakpoint` option:

| Breakpoint Name | Screen Width (px) |
|-----------------|-------------------|
| `sm`            | 576               |
| `md`            | 768               |
| `lg`            | 992               |
| `xl`            | 1200              |
| `xxl`           | 1400              |
| `any number`    | 2000              |

---

### Methods

The Affix element fires three events:

```javascript
$(document)
    .on('init', '#my-sticky-element', function (){
        // I am now part of the Affix Plugin
    })
    .on('affixed', '#my-sticky-element', function (){
        // I was pinned
    })
    .on('unaffixed', '#my-sticky-element', function (){
        // I was unpinned
    })
```

### Example with Options

```html

<div id="custom-sticky-element">
    I will stick with custom settings!
</div>

<script>
    $(document).ready(function () {
        $('#custom-sticky-element').affix({
            offsetTop: 50,          // Stick 50px below the viewport top
            breakpoint: 'md'        // Activate sticky only on screens >= 768px wide
        });
    });
</script>
```

---

## Advanced Usage

### Multiple Sticky Elements

The plugin automatically handles multiple sticky elements and ensures that each subsequent element takes into account
the height of the previous ones. Here's an example:

```html

<div class="affix-item">Element 1</div>
<div class="affix-item">Element 2</div>

<script>
    $(document).ready(function () {
        $('.affix-item').affix({
            offsetTop: 10 // Each element will stick 10px below the previous one
        });
    });
</script>
```

### Directly Specifying Breakpoints

You can pass numerical values as breakpoints instead of predefined strings:

```html

<div id="dynamic-breakpoint">
    I stick on screens >= 1000px wide.
</div>

<script>
    $(document).ready(function () {
        $('#dynamic-breakpoint').affix({
            breakpoint: 1000 // Activate sticky only on screens >= 1000px wide
        });
    });
</script>
```

---

## How It Works

Here is a brief overview of the plugin's internal behavior:

1. **Initialization**:
    - The plugin processes each element and attaches settings like `offsetTop` and `breakpoint`.
    - Registers a `ResizeObserver` for dynamic recalculations.

2. **Sticky Logic**:
    - Calculates offsets for each sticky element, based on its position in the DOM and the height of prior elements.
    - Uses predefined or custom breakpoints to enable/disable sticky positioning dynamically.

3. **Positioning**:
    - Applies `position: sticky` and adjusts `top` and `z-index` to maintain order and avoid overlaps.

---

## Browser Support

This plugin relies on the browser's support for the CSS `position: sticky` property. Ensure your users have a modern
browser for full functionality.

Tested on:

- Google Chrome (latest versions)
- Mozilla Firefox (latest versions)
- Microsoft Edge

---

## Troubleshooting

- **Sticky not working on older browsers**:
  Ensure the browser supports the CSS `position: sticky` property. Check [Can I Use](https://caniuse.com/?search=sticky)
  for browser compatibility.

- **Element not sticking at the correct position**:
  Double-check the `offsetTop` setting and ensure no `margin` or `transform` styles are interfering with the sticky
  behavior.

---

## License

This plugin is open-source and available under the **MIT License**.

---

## Author

This plugin was created to simplify sticky functionality for dynamic web interfaces using jQuery.

If you have any feedback or questions, feel free to reach out!