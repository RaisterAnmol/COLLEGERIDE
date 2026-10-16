/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // CampusRide Tactile Neumorphic Palette (Plum & Sage)
        plum: {
          DEFAULT: "var(--plum, #743A59)",
          hover: "var(--plum-hover, #5C2B45)",
          light: "var(--plum-light, #F4EBF0)",
          border: "var(--plum-border, #D9B8C9)",
        },
        sage: {
          DEFAULT: "var(--canvas, #E8EBE6)",
          surface: "var(--paper, #F6F8F5)",
          border: "var(--border, #D7DCD5)",
        },
        paper: {
          DEFAULT: "var(--paper, #F6F8F5)",
          white: "var(--card-white, #FFFFFF)",
        },
        forest: {
          DEFAULT: "var(--green, #1B5E43)",
          light: "var(--green-light, #DCFCE7)",
          border: "var(--green-border, #86EFAC)",
        },
        canvas: {
          DEFAULT: "var(--canvas, #E8EBE6)",
        },
        surface: {
          DEFAULT: "var(--surface, #F6F8F5)",
          raised: "var(--surface-raised, #FFFFFF)",
        },
        ink: {
          primary: "var(--ink-primary, #1F2622)",
          secondary: "var(--ink-secondary, #5C6761)",
          muted: "var(--ink-muted, #7E8A84)",
          tertiary: "var(--ink-muted, #7E8A84)",
        },
        route: {
          DEFAULT: "var(--route, #743A59)",
          light: "var(--route-light, #8E496F)",
          pale: "var(--route-pale, #F4EBF0)",
        },
        signal: {
          amber: "var(--signal-amber, #D97706)",
          crimson: "var(--emergency-crimson, #DC2626)",
        },
        "emergency-crimson": "#DC2626",
        line: {
          subtle: "var(--line-subtle, #E5E9E3)",
          base: "var(--line-base, #D7DCD5)",
          strong: "var(--line-strong, #A8B1A5)",
        },

        // Backwards compatibility mappings for primary and brand
        primary: {
          DEFAULT: "#743A59",
          50: "#F4EBF0",
          100: "#E9D7E2",
          200: "#D9B8C9",
          300: "#BF8DA7",
          400: "#9C5E82",
          500: "#743A59",
          600: "#5C2B45",
          700: "#472135",
          800: "#331626",
          900: "#220D19",
        },
        campus: {
          50: "#F4EBF0",
          100: "#E9D7E2",
          500: "#743A59",
          600: "#5C2B45",
          700: "#472135",
          800: "#331626",
          900: "#220D19",
        },
        brand: {
          50: "#F4EBF0",
          100: "#E9D7E2",
          500: "#743A59",
          600: "#5C2B45",
          700: "#472135",
        },
        status: {
          success: "#1B5E43",
          warning: "#D97706",
          emergency: "#DC2626",
          info: "#4F8098",
        },
      },
      fontFamily: {
        display: [
          '"Fraunces"',
          '"Plus Jakarta Sans"',
          "Inter",
          "serif",
        ],
        sans: [
          "Inter",
          '"DM Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"Space Mono"',
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        card: "24px",
        control: "12px",
        surface: "24px",
        ticket: "16px",
        pill: "9999px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(31, 38, 34, 0.04)",
        card: "0 4px 16px 0 rgba(31, 38, 34, 0.06)",
        ticket: "0 4px 20px rgba(31, 38, 34, 0.06)",
        dropdown: "0 4px 12px 0 rgba(31, 38, 34, 0.08)",
        modal: "0 12px 32px -4px rgba(31, 38, 34, 0.12)",
        // Neumorphic tactile shadows
        "neu-card": "-6px -6px 14px rgba(255, 255, 255, 0.95), 6px 6px 16px rgba(31, 38, 34, 0.08)",
        "neu-card-sm": "-3px -3px 8px rgba(255, 255, 255, 0.95), 3px 3px 10px rgba(31, 38, 34, 0.07)",
        "neu-card-lg": "-10px -10px 24px rgba(255, 255, 255, 0.95), 12px 12px 28px rgba(31, 38, 34, 0.12)",
        "neu-sunken": "inset 2px 2px 5px rgba(31, 38, 34, 0.10), inset -2px -2px 5px rgba(255, 255, 255, 0.95)",
        "neu-sunken-deep": "inset 3px 3px 8px rgba(31, 38, 34, 0.14), inset -3px -3px 8px rgba(255, 255, 255, 0.9)",
        "neu-btn": "-3px -3px 8px rgba(255, 255, 255, 0.95), 3px 3px 8px rgba(31, 38, 34, 0.09)",
        "neu-btn-active": "inset 2px 2px 4px rgba(31, 38, 34, 0.18), inset -1px -1px 3px rgba(255, 255, 255, 0.6)",
      },
    },
  },
  plugins: [],
};
