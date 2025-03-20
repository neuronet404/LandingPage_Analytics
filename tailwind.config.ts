import type { Config } from "tailwindcss";
const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
			brand: {
				'100': '#9333EA',  // Purple from the 'A' in logo
				DEFAULT: '#818CF8'  // Indigo/purple blend
			  },
			  red: '#EF4444',      // Keeping a red for error states
			  error: '#DC2626',    // Darker red for critical errors
			  green: '#14B8A6',    // Teal green from the 'E' in logo
			  blue: '#3B82F6',     // Blue from the 'O' in logo
			  pink: '#8B5CF6',     // Purple variant
			  orange: '#06B6D4',   // Cyan from 'Y' in logo
			  light: {
				'100': '#333F4E',  // Keeping original
				'200': '#A3B2C7',  // Keeping original
				'300': '#F2F5F9',  // Keeping original
				'400': '#F2F4F8'   // Keeping original
			  },
			  dark: {
				'100': '#04050C',  // Keeping original
				'200': '#131524'   // Keeping original
			  },
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
		  boxShadow: {
			'drop-1': '0px 10px 30px 0px rgba(66, 71, 97, 0.1)',
			'drop-2': '0 8px 30px 0 rgba(65, 89, 214, 0.3)',
			'drop-3': '0 8px 30px 0 rgba(65, 89, 214, 0.1)'
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
  	}
  },
  plugins: [require("tailwindcss-animate"), addVariablesForColors,],
} satisfies Config;



// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
	let allColors = flattenColorPalette(theme("colors"));
	let newVars = Object.fromEntries(
	  Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
	);
   
	addBase({
	  ":root": newVars,
	});
  }