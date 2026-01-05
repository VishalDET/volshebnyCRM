// vite.config.js
import { defineConfig } from "file:///D:/repository/volshebnyCRM/node_modules/vite/dist/node/index.js";
import react from "file:///D:/repository/volshebnyCRM/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "D:\\repository\\volshebnyCRM";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@components": path.resolve(__vite_injected_original_dirname, "./src/components"),
      "@pages": path.resolve(__vite_injected_original_dirname, "./src/pages"),
      "@api": path.resolve(__vite_injected_original_dirname, "./src/api"),
      "@hooks": path.resolve(__vite_injected_original_dirname, "./src/hooks"),
      "@context": path.resolve(__vite_injected_original_dirname, "./src/context"),
      "@layouts": path.resolve(__vite_injected_original_dirname, "./src/layouts"),
      "@redux": path.resolve(__vite_injected_original_dirname, "./src/redux"),
      "@config": path.resolve(__vite_injected_original_dirname, "./src/config"),
      "@assets": path.resolve(__vite_injected_original_dirname, "./src/assets"),
      "@styles": path.resolve(__vite_injected_original_dirname, "./src/styles")
    }
  },
  server: {
    port: 3e3,
    open: true,
    host: true,
    proxy: {
      "/api": {
        target: "http://volcrmapi.digitaledgetech.in",
        changeOrigin: true,
        secure: false
      }
      // ,
      // '/ManageServiceMaster': {
      //     target: 'http://volcrmapi.digitaledgetech.in',
      //     changeOrigin: true,
      //     secure: false
      // },
      // '/ManageDestinationMaster': {
      //     target: 'http://volcrmapi.digitaledgetech.in',
      //     changeOrigin: true,
      //     secure: false
      // },
      // '/ManageSupplierMaster': {
      //     target: 'http://volcrmapi.digitaledgetech.in',
      //     changeOrigin: true,
      //     secure: false
      // }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxyZXBvc2l0b3J5XFxcXHZvbHNoZWJueUNSTVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxccmVwb3NpdG9yeVxcXFx2b2xzaGVibnlDUk1cXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3JlcG9zaXRvcnkvdm9sc2hlYm55Q1JNL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICAgICAgICdAY29tcG9uZW50cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAgICAgICAnQHBhZ2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3BhZ2VzJyksXG4gICAgICAgICAgICAnQGFwaSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9hcGknKSxcbiAgICAgICAgICAgICdAaG9va3MnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvaG9va3MnKSxcbiAgICAgICAgICAgICdAY29udGV4dCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb250ZXh0JyksXG4gICAgICAgICAgICAnQGxheW91dHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvbGF5b3V0cycpLFxuICAgICAgICAgICAgJ0ByZWR1eCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9yZWR1eCcpLFxuICAgICAgICAgICAgJ0Bjb25maWcnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29uZmlnJyksXG4gICAgICAgICAgICAnQGFzc2V0cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9hc3NldHMnKSxcbiAgICAgICAgICAgICdAc3R5bGVzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3N0eWxlcycpLFxuICAgICAgICB9XG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgICAgcG9ydDogMzAwMCxcbiAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgICAgcHJveHk6IHtcbiAgICAgICAgICAgICcvYXBpJzoge1xuICAgICAgICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly92b2xjcm1hcGkuZGlnaXRhbGVkZ2V0ZWNoLmluJyxcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICAgICAgc2VjdXJlOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gLFxuICAgICAgICAgICAgLy8gJy9NYW5hZ2VTZXJ2aWNlTWFzdGVyJzoge1xuICAgICAgICAgICAgLy8gICAgIHRhcmdldDogJ2h0dHA6Ly92b2xjcm1hcGkuZGlnaXRhbGVkZ2V0ZWNoLmluJyxcbiAgICAgICAgICAgIC8vICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICAvLyAgICAgc2VjdXJlOiBmYWxzZVxuICAgICAgICAgICAgLy8gfSxcblxuICAgICAgICAgICAgLy8gJy9NYW5hZ2VEZXN0aW5hdGlvbk1hc3Rlcic6IHtcbiAgICAgICAgICAgIC8vICAgICB0YXJnZXQ6ICdodHRwOi8vdm9sY3JtYXBpLmRpZ2l0YWxlZGdldGVjaC5pbicsXG4gICAgICAgICAgICAvLyAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgLy8gICAgIHNlY3VyZTogZmFsc2VcbiAgICAgICAgICAgIC8vIH0sXG4gICAgICAgICAgICAvLyAnL01hbmFnZVN1cHBsaWVyTWFzdGVyJzoge1xuICAgICAgICAgICAgLy8gICAgIHRhcmdldDogJ2h0dHA6Ly92b2xjcm1hcGkuZGlnaXRhbGVkZ2V0ZWNoLmluJyxcbiAgICAgICAgICAgIC8vICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICAvLyAgICAgc2VjdXJlOiBmYWxzZVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1EsU0FBUyxvQkFBb0I7QUFDblMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLGVBQWUsS0FBSyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLE1BQ3pELFVBQVUsS0FBSyxRQUFRLGtDQUFXLGFBQWE7QUFBQSxNQUMvQyxRQUFRLEtBQUssUUFBUSxrQ0FBVyxXQUFXO0FBQUEsTUFDM0MsVUFBVSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQy9DLFlBQVksS0FBSyxRQUFRLGtDQUFXLGVBQWU7QUFBQSxNQUNuRCxZQUFZLEtBQUssUUFBUSxrQ0FBVyxlQUFlO0FBQUEsTUFDbkQsVUFBVSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQy9DLFdBQVcsS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUNqRCxXQUFXLEtBQUssUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDakQsV0FBVyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLElBQ3JEO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0gsUUFBUTtBQUFBLFFBQ0osUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBa0JKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
