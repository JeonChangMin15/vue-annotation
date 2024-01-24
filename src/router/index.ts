import { createRouter, createWebHistory } from "vue-router";
import MainVue from "@/page/Main.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: MainVue,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
