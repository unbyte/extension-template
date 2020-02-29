const pkg = require("../package.json");

const manifestInput = {
  manifest_version: 2,
  name: "extension template",
  version: pkg.version,

  icons: {
    "16": "assets/icons/icon_16x16.png",
    "48": "assets/icons/icon_48x48.png",
    "64": "assets/icons/icon_64x64.png",
    "128": "assets/icons/icon_128x128.png"
  },

  description: "extension template",
  homepage_url: "https://github.com/unbyte/extension-template.git",
  short_name: "extension template",

  permissions: ["activeTab", "storage", "http://*/*", "https://*/*"],
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",

  // "__chrome|firefox__author": "helios",
  /*  __opera__developer: {
      name: ""
    },*/

  /*
    __firefox__applications: {
      gecko: { id: "{}" }
    },*/

  __chrome__minimum_chrome_version: "49",
  __opera__minimum_opera_version: "36",

  browser_action: {
    default_popup: "popup.html",
    default_icon: {
      "16": "assets/icons/icon_16x16.png",
      "48": "assets/icons/icon_48x48.png",
      "64": "assets/icons/icon_64x64.png",
      "128": "assets/icons/icon_128x128.png"
    },
    default_title: "tiny title",
    "__chrome|opera__chrome_style": false,
    __firefox__browser_style: false
  },

  "__chrome|opera__options_page": "options.html",

  options_ui: {
    page: "options.html",
    open_in_tab: true,
    __chrome__chrome_style: false
  },

  background: {
    scripts: ["js/background.bundle.js"],
    "__chrome|opera__persistent": false
  },

  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["js/content.bundle.js"]
    }
  ]
};

module.exports = manifestInput;
