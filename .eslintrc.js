module.exports = {
  "extends": "airbnb-base",
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
		"comma-dangle": [2, {
			"arrays": "always-multiline",
			"objects": "always-multiline",
			"imports": "never",
			"exports": "never",
			"functions": "never"
		}],
    "consistent-return": 0,
    "function-paren-newline": ["error", "never"],
    "implicit-arrow-linebreak": ["off"],
		"indent": [2, "tab"],
    "no-tabs": 0,
    "no-param-reassign": 0,
    "no-underscore-dangle": 0,
    "no-shadow": 0,
		"no-console": process.env.NODE_ENV === "production" ? 'error' : 'off',
		"no-debugger": process.env.NODE_ENV === "production" ? 'error' : 'off',
    "no-plusplus": 0,
    "no-unused-expressions": 0,
		"object-curly-spacing": [2, 'always'],
		"semi": 2,
		"quotes": [2, 'single']
  },
	parserOptions: {
		parser: 'babel-eslint',
	}
};
