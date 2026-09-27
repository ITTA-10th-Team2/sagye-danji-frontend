import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: '사계단지',
  brand: {
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상
  },
  permissions: [],
  webBundleDir: 'dist',
});
