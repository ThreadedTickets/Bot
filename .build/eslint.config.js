
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c52c8f3f-413e-570e-90ba-49ce1f4c2020")}catch(e){}}();
module.exports = [
    {
        languageOptions: {
            ecmaVersion: "latest",
        },
        rules: {
            "arrow-spacing": ["warn", { before: true, after: true }],
            "brace-style": ["error", "stroustrup", { allowSingleLine: true }],
            "comma-dangle": ["error", "always-multiline"],
            "comma-spacing": "error",
            "comma-style": "error",
            curly: ["error", "multi-line", "consistent"],
            "dot-location": ["error", "property"],
            "handle-callback-err": "off",
            indent: ["error", "space"],
            "keyword-spacing": "error",
            "max-nested-callbacks": ["error", { max: 4 }],
            "max-statements-per-line": ["error", { max: 2 }],
            "no-console": "off",
            "no-empty-function": "error",
            "no-floating-decimal": "error",
            "no-inline-comments": "error",
            "no-lonely-if": "error",
            "no-multi-spaces": "error",
            "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1, maxBOF: 0 }],
            "no-shadow": ["error", { allow: ["err", "resolve", "reject"] }],
            "no-trailing-spaces": ["error"],
            "no-var": "error",
            "no-undef": "off",
            "object-curly-spacing": ["error", "always"],
            "prefer-const": "error",
            quotes: ["error", "single"],
            semi: ["error", "always"],
            "space-before-blocks": "error",
            "space-before-function-paren": [
                "error",
                {
                    anonymous: "never",
                    named: "never",
                    asyncArrow: "always",
                },
            ],
            "space-in-parens": "error",
            "space-infix-ops": "error",
            "space-unary-ops": "error",
            "spaced-comment": "error",
            yoda: "error",
        },
    },
];
//# sourceMappingURL=/eslint.config.js.map
//# debugId=c52c8f3f-413e-570e-90ba-49ce1f4c2020
