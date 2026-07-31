<template>
  <view class="container">
    <!-- 输入区域 -->
    <view class="input-wrapper">
      <input
        class="todo-input"
        v-model="inputValue"
        placeholder="添加新的待办事项..."
        confirm-type="done"
        @confirm="addTodo"
      />
      <button class="add-btn" @click="addTodo">添加</button>
    </view>

    <!-- 统计信息 -->
    <view class="stats">
      <text class="stats-text">共 {{ totalCount }} 项，已完成 {{ doneCount }} 项</text>
    </view>

    <!-- 待办列表 -->
    <view class="todo-list" v-if="todoList.length > 0">
      <view
        class="todo-item"
        v-for="(item, index) in todoList"
        :key="item.id"
      >
        <view class="checkbox-wrapper" @click="toggleTodo(index)">
          <view class="checkbox" :class="{ checked: item.done }">
            <text v-if="item.done" class="check-icon">✓</text>
          </view>
        </view>
        <text class="todo-text" :class="{ done: item.done }">{{ item.text }}</text>
        <view class="delete-btn" @click="deleteTodo(index)">
          <text class="delete-icon">×</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <text class="empty-icon">📝</text>
      <text class="empty-text">暂无待办事项</text>
      <text class="empty-subtext">在上方输入框添加你的第一条待办吧</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inputValue: '',
      todoList: [
        { id: 1, text: '欢迎使用 Todo 待办', done: false },
        { id: 2, text: '点击左侧圆圈标记完成', done: false },
        { id: 3, text: '点击右侧 × 删除事项', done: true }
      ]
    }
  },
  computed: {
    totalCount() {
      return this.todoList.length
    },
    doneCount() {
      return this.todoList.filter(item => item.done).length
    }
  },
  methods: {
    addTodo() {
      const text = this.inputValue.trim()
      if (!text) {
        uni.showToast({
          title: '请输入待办内容',
          icon: 'none'
        })
        return
      }
      this.todoList.unshift({
        id: Date.now(),
        text: text,
        done: false
      })
      this.inputValue = ''
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
    },
    toggleTodo(index) {
      this.todoList[index].done = !this.todoList[index].done
    },
    deleteTodo(index) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这条待办吗？',
        success: (res) => {
          if (res.confirm) {
            this.todoList.splice(index, 1)
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.todo-input {
  flex: 1;
  height: 72rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.add-btn {
  background-color: #007aff;
  color: #fff;
  font-size: 28rpx;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 32rpx;
  border-radius: 8rpx;
  margin: 0;
}

.add-btn::after {
  border: none;
}

.stats {
  padding: 16rpx 24rpx;
  margin-bottom: 16rpx;
}

.stats-text {
  font-size: 24rpx;
  color: #999;
}

.todo-list {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
}

.checkbox-wrapper {
  margin-right: 20rpx;
}

.checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  transition: all 0.2s ease;
}

.checkbox.checked {
  background-color: #4cd964;
  border-color: #4cd964;
}

.check-icon {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.todo-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
}

.todo-text.done {
  color: #999;
  text-decoration: line-through;
}

.delete-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
  margin-left: 16rpx;
}

.delete-icon {
  color: #999;
  font-size: 36rpx;
  line-height: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.empty-subtext {
  font-size: 26rpx;
  color: #999;
}
</style>
