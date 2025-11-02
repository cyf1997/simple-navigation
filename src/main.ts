import { createApp } from 'vue'
import App from './App.vue'
import naive from 'naive-ui' 
import './styles/index.css';
// 引入所有图标
import * as Icons from '@vicons/ionicons5'
import router from './router'


const app = createApp(App);


Object.keys(Icons).forEach((key) => {
  app.component(key, (Icons as Record<string, any>)[key])
})
app.use(naive)
app.use(router)
app.mount('#app')
