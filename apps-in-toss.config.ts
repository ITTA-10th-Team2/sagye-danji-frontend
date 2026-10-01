import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'sagye-danji',
  brand: {
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상
  },
  navigationBar: {
    withHomeButton: true,
  },
  permissions: [
    {
      name: 'camera',
      access: 'access',
    },
    {
      name: 'photos',
      access: 'read',
    },
  ],
  webBundleDir: 'dist',
});
