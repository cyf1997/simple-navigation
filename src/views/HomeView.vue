<template>
  <n-config-provider>

    <n-layout-header style="height: 80px; padding: 0 24px; display: flex; align-items: center;" bordered>
      <!-- 使用n-flex实现弹性布局 -->
      <n-flex justify="space-between" style="width: 100%;" class="justify-center" >
        <!-- Logo和标题部分，在小屏幕上隐藏 -->
        <div v-show="windowWidth > 600" style="line-height: 80px;">
          <n-flex align="center">
             <n-icon color="#18a058" size="45" class="rotate-icon">
              <ColorFilterSharp/>
            </n-icon>
              <n-text style="font-size: 20px;">
                  综合导航
             </n-text>
          </n-flex>
        </div>

        <!-- 搜索框部分，在任何屏幕尺寸下都显示 -->
        <div style="width: 100%; max-width: 400px; line-height: 80px;" >
          <n-input v-model:value="searchQuery" placeholder="搜索..." size="large">
            <template #prefix>
              <n-icon color="#18a058">
                <Search/>
              </n-icon>
            </template>
          </n-input>
        </div>
        

        <n-flex align="center">
        <!-- 切换按钮，在小屏幕上隐藏 -->
        <div style="line-height: 80px;" v-show="windowWidth > 650">
          <n-switch size="large" v-model:value="spreadOut">
           <template #unchecked-icon>
            <n-icon>
              <EllipsisHorizontal/>
            </n-icon>
          </template>
          <template #checked-icon>
            <n-icon>
              <Apps/>
              </n-icon>
          </template>
          </n-switch>
        </div>
      </n-flex>
        </n-flex>
        
    </n-layout-header>
    <n-layout position="absolute" style="top: 80px; bottom: 64px" has-sider>
      <n-layout-sider v-show="searchQuery=='' && !spreadOut" :width="240" show-trigger
        bordered 
        :collapsed="collapsed"
        collapse-mode="width"
        :collapsed-width="64"
         @collapse="collapsed = true"
        @expand="collapsed = false">
        <n-menu :ref="menuInstRef"
          :value="activeGroupKey"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :on-update:value="handleMenuSelect"
          :options="menuOptions"
          :watch-props="['defaultValue', 'defaultExpandedKeys']" />
      </n-layout-sider>
      <n-layout-content content-style="padding: 24px;">
        <div v-if="filteredGroups.length === 0 && searchQuery">
          <n-empty description="没有找到匹配的内容" />
        </div>
        <div v-else>
          <div v-for="group in filteredGroups" :key="group.id">
            <div class="pb-2 flex items-center">
                <n-icon size="24" color="#18a058" class="mr-2">
                  <component :is="group.icon"/>
                </n-icon>
                <n-text type="primary" class="text-lg font-bold">{{group.name}}</n-text>
            </div>
            <n-grid :x-gap="12" :y-gap="8" cols="1 300:2 600:3 900:4">
            <n-gi v-for="website in group.filteredWebsites" :key="website.id || website.name">
              <n-card hoverable class="cursor-pointer" @click="handleWebsiteClick(website)">
                <n-space item-style="display: flex;" size="large">
                  <n-thing class="cursor-pointer" >
                    <template #avatar>
                        <n-icon color="#18a058" size="24">
                          <component :is="website.icon" />
                        </n-icon>
                    </template>
                    <template #header>{{website.name}}</template>
                    <template #description>
                      <n-ellipsis :line-clamp="1" >{{website.desc || website.description}}</n-ellipsis>
                    </template>
                  </n-thing>
                </n-space>
              </n-card>
              </n-gi>
            </n-grid>
              <n-divider />
          </div>
        </div>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>
<script setup lang="ts">
import type { MenuInst } from 'naive-ui'
import { onMounted, onUnmounted, computed, watch } from 'vue'
import { NIcon, NInput, NEmpty, NButton } from 'naive-ui'
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const collapsed = ref(false)
// 响应式窗口宽度
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

interface Group {
  id: string;
  name: string;
  icon: string;
  websites: Website[];
}

interface Website {
  id?: number;
  name: string;
  url: string;
  icon: string;
  desc?: string;
  description?: string;
}

// 加载本地数据
const allGroups = ref<Group[]>([]);
const activeGroupKey = ref<string | null>(null);

import { resolveComponent } from 'vue'

function renderIcon(icon: string) {
  return () => h(NIcon, null, { default: () => h(resolveComponent(icon)) })
}

const spreadOut = ref(false)
const searchQuery = ref('')
const menuInstRef = ref<MenuInst | null>(null)
const handleMenuSelect = (key: string) => {
  menuInstRef.value?.showOption(key)
  activeGroupKey.value = key;
}

// 处理网站卡片点击事件
const handleWebsiteClick = (website: Website) => {
  // 在新标签页中打开网站URL
  if (website.url) {
    window.open(website.url, '_blank');
  }
}

// 过滤后的菜单选项
const menuOptions = computed(() => {
    return allGroups.value.map(group => ({
      key: group.id,
      label: group.name,
      icon: renderIcon(group.icon)
    }));
});

// 过滤后的组和网站数据
const filteredGroups = computed(() => {
  if (!searchQuery.value.trim()) {
    // 如果没有搜索词，根据显示模式返回相应数据，并确保每个组都有 filteredWebsites 属性
    return (!spreadOut.value ? allGroups.value.filter(group => group.id == activeGroupKey.value) : allGroups.value).map(group => ({
      ...group,
      filteredWebsites: group.websites
    })) as Array<Group & { filteredWebsites: Website[] }>;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  
  // 过滤组和网站
  return allGroups.value
    .map(group => {
      //如果组名包含搜索词，直接返回该组
      if (group.name.toLowerCase().includes(query)) {
        return {
          ...group,
          filteredWebsites: group.websites
        };
      }
      // 过滤该组下的网站
      const filteredWebsites = group.websites.filter(website => 
        website.name.toLowerCase().includes(query) || 
        (website.desc && website.desc.toLowerCase().includes(query)) ||
        (website.description && website.description.toLowerCase().includes(query))
      );
      
      // 如果组名匹配搜索词，或者该组下有匹配的网站，则返回该组及过滤后的网站
      if (filteredWebsites.length > 0) {
        return {
          ...group,
          filteredWebsites
        };
      }
      
      return null;
    })
    .filter(Boolean) as Array<Group & { filteredWebsites: Website[] }>;
});

// 初始化加载数据
const loadData = async () => {
  try {
    const response = await fetch('/data/data.json');
    allGroups.value = (await response.json()).groups;
    activeGroupKey.value = menuOptions.value[0]?.key;
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

onMounted(() => {
  loadData()
});

watch(() => windowWidth.value, (newWidth) => {
  if (newWidth <= 650) {
    spreadOut.value = true;
  } else {
    spreadOut.value = false;
  }
})
</script>

<style scoped>
.rotate-icon {
  transition: transform 0.8s ease;
}

.rotate-icon:hover {
  transform: rotate(240deg);
}
</style>