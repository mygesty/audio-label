import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/main.scss'

import App from './App.vue'
import router from './router'

// 权限指令
import { permissionDirective, roleDirective, canDirective, resourceDirective } from './directives/permission'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 注册权限指令
app.directive('permission', permissionDirective)
app.directive('role', roleDirective)
app.directive('can', canDirective)
app.directive('resource', resourceDirective)

app.mount('#app')
