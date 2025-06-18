import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'JustDid',
  version: '1.0.0',
  description: "Stay mindful of your activities with gentle, customizable prompts to log what you've just accomplished.",

  permissions: [
    'storage',
    'notifications',
    'alarms',
    'history',
    'activeTab',
    'tabs',
    'scripting',
    "downloads",
    "webNavigation", 
    "contextMenus",
    "search" 
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  background: {
    service_worker: 'src/background/background.ts',
    type: 'module'
  },

  action: {
    default_popup: 'src/popup.html',
    default_icon: {
      // '16': 'icons/icon-16.png',
      // '32': 'icons/icon-32.png',
      '48': 'icons/icon.png',
      // '128': 'icons/icon-128.png'
    }
  },

  icons: {
    // '16': 'icons/icon-16.png',
    // '32': 'icons/icon-32.png',
    '48': 'icons/icon.png',
    // '128': 'icons/icon-128.png'
  },

  web_accessible_resources: [
    {
      resources: ['icons/*.png'],
      matches: ['<all_urls>']
    }
  ]
})