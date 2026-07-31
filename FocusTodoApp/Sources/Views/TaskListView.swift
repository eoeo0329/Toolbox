import SwiftUI

struct TaskListView: View {
    @EnvironmentObject var taskStore: TaskStore
    @EnvironmentObject var timerVM: FocusTimerViewModel
    @Environment(\.colorScheme) var colorScheme
    
    @State private var showAddTask = false
    @State private var editingTask: TodoTask?
    @State private var showCompleted = false
    @State private var searchText = ""
    
    var body: some View {
        NavigationStack {
            ZStack {
                backgroundLayer
                
                VStack(spacing: 0) {
                    headerBar
                    
                    categoryScroll
                    
                    if filteredTasks.isEmpty && searchText.isEmpty {
                        emptyStateView
                    } else {
                        taskList
                    }
                }
            }
            .sheet(isPresented: $showAddTask) {
                AddTaskView(task: nil) { task in
                    taskStore.addTask(task)
                }
                .environmentObject(taskStore)
            }
            .sheet(item: $editingTask) { task in
                AddTaskView(task: task) { updatedTask in
                    taskStore.updateTask(updatedTask)
                }
                .environmentObject(taskStore)
            }
            .onReceive(NotificationCenter.default.publisher(for: .incrementPomodoro)) { notification in
                if let taskId = notification.object as? UUID,
                   let task = taskStore.tasks.first(where: { $0.id == taskId }) {
                    taskStore.incrementPomodoro(for: task)
                }
            }
        }
    }
    
    private var backgroundLayer: some View {
        Group {
            if colorScheme == .dark {
                Color.black.ignoresSafeArea()
            } else {
                LinearGradient(
                    colors: [
                        AppTheme.surface,
                        Color.white
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            }
        }
    }
    
    private var headerBar: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("待办事项")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(.primary)
                    
                    Text("\(taskStore.pendingTasks.count) 待完成 · \(taskStore.completedTasks.count) 已完成")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Button {
                    showAddTask = true
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.black)
                        .frame(width: 44, height: 44)
                        .background(
                            Circle()
                                .fill(AppTheme.yellow)
                                .shadow(color: AppTheme.yellow.opacity(0.4), radius: 12, x: 0, y: 6)
                        )
                }
            }
            
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                
                TextField("搜索任务...", text: $searchText)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.primary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(colorScheme == .dark ? Color.white.opacity(0.06) : Color.gray.opacity(0.08))
            )
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
        .padding(.bottom, 12)
    }
    
    private var categoryScroll: some View {
        VStack(spacing: 12) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    categoryButton(title: "全部", category: nil, icon: "square.grid.2x2.fill")
                    
                    ForEach(TodoTask.Category.allCases) { category in
                        categoryButton(
                            title: category.title,
                            category: category,
                            icon: category.icon
                        )
                    }
                }
                .padding(.horizontal, 20)
            }
            
            HStack {
                Menu {
                    ForEach(TaskStore.SortOrder.allCases, id: \.self) { order in
                        Button(order.rawValue) {
                            taskStore.sortOrder = order
                        }
                    }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.up.arrow.down")
                            .font(.system(size: 13, weight: .semibold))
                        Text(taskStore.sortOrder.rawValue)
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        Capsule()
                            .fill(colorScheme == .dark ? Color.white.opacity(0.06) : Color.gray.opacity(0.1))
                    )
                }
                
                Spacer()
                
                Button {
                    withAnimation { showCompleted.toggle() }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: showCompleted ? "checkmark.circle.fill" : "checkmark.circle")
                            .font(.system(size: 13, weight: .semibold))
                        Text("已完成")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundColor(showCompleted ? AppTheme.blue : .secondary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        Capsule()
                            .fill(showCompleted ? AppTheme.blue.opacity(0.12) : (colorScheme == .dark ? Color.white.opacity(0.06) : Color.gray.opacity(0.1)))
                    )
                }
            }
            .padding(.horizontal, 20)
        }
        .padding(.bottom, 8)
    }
    
    private func categoryButton(title: String, category: TodoTask.Category?, icon: String) -> some View {
        let isSelected = taskStore.selectedCategory == category
        let count = category == nil ? taskStore.tasks.count : taskStore.tasks.filter { $0.category == category }.count
        
        return Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                taskStore.selectedCategory = category
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .semibold))
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                Text("\(count)")
                    .font(.system(size: 11, weight: .bold))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(
                        Capsule()
                            .fill(isSelected ? Color.white.opacity(0.3) : Color.gray.opacity(0.15))
                    )
            }
            .foregroundColor(isSelected ? .white : .secondary)
            .padding(.horizontal, 14)
            .padding(.vertical, 9)
            .background(
                Capsule()
                    .fill(isSelected ? AppTheme.blue : (colorScheme == .dark ? Color.white.opacity(0.05) : Color.gray.opacity(0.1)))
            )
            .overlay(
                Capsule()
                    .stroke(isSelected ? AppTheme.blue : Color.clear, lineWidth: 1.5)
            )
        }
        .buttonStyle(.plain)
    }
    
    private var filteredTasks: [TodoTask] {
        var result = showCompleted ? taskStore.filteredTasks : taskStore.pendingTasks
        
        if !searchText.isEmpty {
            result = result.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.description.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return result
    }
    
    private var taskList: some View {
        ScrollView {
            LazyVStack(spacing: 10) {
                ForEach(filteredTasks) { task in
                    TaskCardView(
                        task: task,
                        onToggle: { taskStore.toggleComplete(task) },
                        onEdit: { editingTask = task },
                        onDelete: { taskStore.deleteTask(task) },
                        onStartFocus: {
                            timerVM.selectedTask = task
                        }
                    )
                    .transition(.asymmetric(
                        insertion: .scale(scale: 0.9).combined(with: .opacity),
                        removal: .scale(scale: 0.9).combined(with: .opacity)
                    ))
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 100)
        }
        .animation(.easeInOut(duration: 0.25), value: filteredTasks.count)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Spacer()
            
            ZStack {
                Circle()
                    .fill(AppTheme.blue.opacity(0.1))
                    .frame(width: 120, height: 120)
                
                Image(systemName: "checklist")
                    .font(.system(size: 54, weight: .light))
                    .foregroundColor(AppTheme.blue)
            }
            
            VStack(spacing: 8) {
                Text("暂无任务")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.primary)
                
                Text("点击右上角按钮添加新任务，开始你的高效一天")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
            
            Button {
                showAddTask = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 18, weight: .semibold))
                    Text("创建第一个任务")
                        .font(.system(size: 16, weight: .semibold))
                }
                .foregroundColor(.black)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(AppTheme.yellow)
                        .shadow(color: AppTheme.yellow.opacity(0.4), radius: 16, x: 0, y: 8)
                )
            }
            .padding(.top, 8)
            
            Spacer()
        }
    }
}

struct TaskCardView: View {
    let task: TodoTask
    var onToggle: () -> Void
    var onEdit: () -> Void
    var onDelete: () -> Void
    var onStartFocus: () -> Void
    
    @Environment(\.colorScheme) var colorScheme
    @State private var isDragging = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 14) {
                Toggle(isOn: .constant(task.isCompleted), label: {})
                    .toggleStyle(IconToggleStyle())
                    .onTapGesture { onToggle() }
                    .padding(.top, 2)
                
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(task.title)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(task.isCompleted ? .secondary : .primary)
                                .strikethrough(task.isCompleted, color: .secondary)
                            
                            if !task.description.isEmpty {
                                Text(task.description)
                                    .font(.system(size: 13, weight: .regular))
                                    .foregroundColor(.secondary)
                                    .lineLimit(2)
                            }
                        }
                        
                        Spacer()
                        
                        menuButton
                    }
                    
                    HStack(spacing: 8) {
                        categoryTag
                        priorityTag
                        
                        if let dueDate = task.dueDate {
                            dueDateTag(dueDate)
                        }
                    }
                    
                    HStack {
                        pomodoroProgress
                        
                        Spacer()
                        
                        if !task.isCompleted {
                            Button {
                                onStartFocus()
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: "timer")
                                        .font(.system(size: 12, weight: .semibold))
                                    Text("专注")
                                        .font(.system(size: 13, weight: .semibold))
                                }
                                .foregroundColor(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(
                                    Capsule()
                                        .fill(
                                            LinearGradient(
                                                colors: [AppTheme.blue, AppTheme.blue.opacity(0.8)],
                                                startPoint: .top,
                                                endPoint: .bottom
                                            )
                                        )
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding(16)
        }
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(
                    task.isCompleted ?
                    (colorScheme == .dark ? Color.white.opacity(0.03) : Color.gray.opacity(0.04)) :
                        (colorScheme == .dark ? Color.white.opacity(0.06) : Color.white)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(
                            task.isCompleted ? Color.gray.opacity(0.1) : Color.black.opacity(0.05),
                            lineWidth: 1
                        )
                )
                .shadow(color: task.isCompleted ? .clear : Color.black.opacity(0.04), radius: 12, x: 0, y: 4)
        )
        .contentShape(Rectangle())
        .contextMenu {
            Button {
                onEdit()
            } label: {
                Label("编辑", systemImage: "pencil")
            }
            
            Button {
                onToggle()
            } label: {
                Label(task.isCompleted ? "标记未完成" : "标记完成", systemImage: "checkmark.circle")
            }
            
            Divider()
            
            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("删除", systemImage: "trash")
            }
        }
    }
    
    private var menuButton: some View {
        Menu {
            Button {
                onEdit()
            } label: {
                Label("编辑", systemImage: "pencil")
            }
            
            Button {
                onToggle()
            } label: {
                Label(task.isCompleted ? "标记未完成" : "标记完成", systemImage: "checkmark.circle")
            }
            
            Divider()
            
            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("删除", systemImage: "trash")
            }
        } label: {
            Image(systemName: "ellipsis")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.secondary)
                .frame(width: 32, height: 32)
                .contentShape(Rectangle())
        }
        .menuStyle(.borderlessButton)
        .menuIndicator(.hidden)
    }
    
    private var categoryTag: some View {
        HStack(spacing: 4) {
            Image(systemName: task.category.icon)
                .font(.system(size: 10, weight: .semibold))
            Text(task.category.title)
                .font(.system(size: 11, weight: .semibold))
        }
        .foregroundColor(.white)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill(AppTheme.blue.opacity(0.85))
        )
    }
    
    private var priorityTag: some View {
        Text(task.priority.title + "优先级")
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(task.priority.color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(task.priority.color.opacity(0.12))
            )
    }
    
    private func dueDateTag(_ date: Date) -> some View {
        let calendar = Calendar.current
        let isOverdue = date < Date() && !task.isCompleted
        let isToday = calendar.isDateInToday(date)
        
        return HStack(spacing: 4) {
            Image(systemName: isOverdue ? "exclamationmark.circle.fill" : "calendar")
                .font(.system(size: 10, weight: .semibold))
            Text(formattedDueDate(date))
                .font(.system(size: 11, weight: .semibold))
        }
        .foregroundColor(isOverdue ? .red : (isToday ? AppTheme.yellow : .secondary))
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill(isOverdue ? Color.red.opacity(0.12) : (isToday ? AppTheme.yellow.opacity(0.18) : Color.gray.opacity(0.1)))
        )
    }
    
    private func formattedDueDate(_ date: Date) -> String {
        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        
        if calendar.isDateInToday(date) {
            return "今天 " + formatTime(date)
        } else if calendar.isDateInTomorrow(date) {
            return "明天 " + formatTime(date)
        } else if calendar.isDateInYesterday(date) {
            return "昨天"
        } else {
            formatter.dateFormat = "M月d日"
            return formatter.string(from: date)
        }
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }
    
    private var pomodoroProgress: some View {
        HStack(spacing: 4) {
            HStack(spacing: 3) {
                ForEach(0..<task.estimatedPomodoros, id: \.self) { i in
                    Image(systemName: i < task.completedPomodoros ? "drop.fill" : "drop")
                        .font(.system(size: 12))
                        .foregroundColor(i < task.completedPomodoros ? AppTheme.blue : Color.gray.opacity(0.3))
                }
            }
            
            Text("\(task.completedPomodoros)/\(task.estimatedPomodoros)")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.secondary)
        }
    }
}

struct AddTaskView: View {
    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.dismiss) private var dismiss
    
    let task: TodoTask?
    var onSave: (TodoTask) -> Void
    
    @State private var title: String = ""
    @State private var descriptionText: String = ""
    @State private var priority: TodoTask.Priority = .medium
    @State private var category: TodoTask.Category = .work
    @State private var hasDueDate: Bool = false
    @State private var dueDate: Date = Date()
    @State private var estimatedPomodoros: Int = 1
    
    private var isEditing: Bool { task != nil }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    titleSection
                    descriptionSection
                    categorySection
                    prioritySection
                    pomodoroSection
                    dueDateSection
                }
                .padding(20)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle(isEditing ? "编辑任务" : "新建任务")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                    .foregroundColor(.secondary)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        save()
                    } label: {
                        Text(isEditing ? "保存" : "添加")
                            .font(.system(size: 16, weight: .bold))
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .foregroundColor(AppTheme.blue)
                }
            }
            .onAppear {
                if let task = task {
                    title = task.title
                    descriptionText = task.description
                    priority = task.priority
                    category = task.category
                    estimatedPomodoros = task.estimatedPomodoros
                    if let due = task.dueDate {
                        hasDueDate = true
                        dueDate = due
                    }
                }
            }
        }
    }
    
    private var titleSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("标题")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.secondary)
                .padding(.horizontal, 4)
            
            TextField("输入任务标题...", text: $title, axis: .vertical)
                .font(.system(size: 17, weight: .semibold))
                .lineLimit(1...3)
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.white)
                )
        }
    }
    
    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("描述")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.secondary)
                .padding(.horizontal, 4)
            
            TextEditor(text: $descriptionText)
                .font(.system(size: 15))
                .scrollContentBackground(.hidden)
                .padding(12)
                .frame(minHeight: 100)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.white)
                )
        }
    }
    
    private var categorySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("分类")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.secondary)
                .padding(.horizontal, 4)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 3), spacing: 10) {
                ForEach(TodoTask.Category.allCases) { cat in
                    Button {
                        category = cat
                    } label: {
                        VStack(spacing: 8) {
                            Image(systemName: cat.icon)
                                .font(.system(size: 22))
                                .foregroundColor(category == cat ? .white : AppTheme.blue)
                            
                            Text(cat.title)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(category == cat ? .white : .primary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(category == cat ? AppTheme.blue : Color.white)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
    
    private var prioritySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("优先级")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.secondary)
                .padding(.horizontal, 4)
            
            HStack(spacing: 8) {
                ForEach(TodoTask.Priority.allCases) { p in
                    Button {
                        priority = p
                    } label: {
                        Text(p.title)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(priority == p ? .white : p.color)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .fill(priority == p ? p.color : p.color.opacity(0.12))
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
    
    private var pomodoroSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("预计番茄数")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 4)
                
                Spacer()
                
                HStack(spacing: 12) {
                    Button {
                        if estimatedPomodoros > 1 { estimatedPomodoros -= 1 }
                    } label: {
                        Image(systemName: "minus.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(estimatedPomodoros > 1 ? AppTheme.blue : .gray.opacity(0.3))
                    }
                    .disabled(estimatedPomodoros <= 1)
                    
                    Text("\(estimatedPomodoros)")
                        .font(.system(size: 18, weight: .bold))
                        .frame(minWidth: 32)
                    
                    Button {
                        if estimatedPomodoros < 12 { estimatedPomodoros += 1 }
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(estimatedPomodoros < 12 ? AppTheme.blue : .gray.opacity(0.3))
                    }
                    .disabled(estimatedPomodoros >= 12)
                }
                .padding(6)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.white)
                )
            }
            .padding(.horizontal, 4)
        }
    }
    
    private var dueDateSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("截止日期")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 4)
                
                Spacer()
                
                Toggle("", isOn: $hasDueDate)
                    .labelsHidden()
                    .tint(AppTheme.blue)
            }
            
            if hasDueDate {
                DatePicker(
                    "选择日期",
                    selection: $dueDate,
                    in: Date()...,
                    displayedComponents: [.date, .hourAndMinute]
                )
                .datePickerStyle(.graphical)
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.white)
                )
            }
        }
    }
    
    private func save() {
        var newTask: TodoTask
        if let existing = task {
            newTask = existing
            newTask.title = title
            newTask.description = descriptionText
            newTask.priority = priority
            newTask.category = category
            newTask.estimatedPomodoros = estimatedPomodoros
            newTask.dueDate = hasDueDate ? dueDate : nil
        } else {
            newTask = TodoTask(
                title: title,
                description: descriptionText,
                priority: priority,
                dueDate: hasDueDate ? dueDate : nil,
                estimatedPomodoros: estimatedPomodoros,
                category: category
            )
        }
        onSave(newTask)
        dismiss()
    }
}
