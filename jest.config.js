export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // برای فایل‌های جاوااسکریپت و تایپ‌اسکریپت
    "^.+\\.css$": "jest-transform-css", // برای فایل‌های CSS
  },
  transformIgnorePatterns: ["/node_modules/"], // جلوگیری از پردازش نادرست node_modules
};
