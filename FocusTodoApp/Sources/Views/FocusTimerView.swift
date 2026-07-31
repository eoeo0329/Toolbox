import SwiftUI

struct FocusTimerView: View {
    @EnvironmentObject var timerVM: FocusTimerViewModel
    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.colorScheme) var colorScheme
    
    @State private var showTaskPicker = false
    @State private var showSettings = false
    @State private var customMinutes: Double = 25
    
    var body: some View {
        NavigationStack {
            ZStack {
                backgroundLayer
                
                ScrollView {
                    VStack(spacing: 28) {
                        headerSection
                        sessionTypePicker
                        timerCircleSection
                        controlButtons
                        currentTaskSection
                        quickStatsSection
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
                .padding(.top, 8)
            }
            .sheet(isPresented: $showTaskPicker) {
                TaskPickerView(selectedTask: $timerVM.selectedTask)
                    .environmentObject(taskStore)
            }
            .sheet(isPresented: $showSettings) {
                TimerSettingsView(
                    customMinutes: $customMinutes,
                    sessionType: timerVM.sessionType
                ) { minutes in
                    timerVM.setCustomDuration(minutes: minutes)
                }
                .presentationDetents([.medium])
            }
            .alert("太棒了！", isPresented: $timerVM.showCompletionAlert) {
                Button("继续", role: .cancel) { }
            } message: {
                Text("\(timerVM.sessionType == .focus ? "专注时段" : "休息")已完成！继续保持专注 🎯")
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
                        Color.white,
                        AppTheme.blue.opacity(0.03)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            }
        }
    }
    
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("专注计时器")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                Text("\(timerVM.focusCount) 个番茄 · 今日 \(timerVM.todayFocusMinutes) 分钟")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button {
                showSettings = true
            } label: {
                Image(systemName: "slider.horizontal.3")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(AppTheme.blue)
                    .frame(width: 44, height: 44)
                    .background(
                        Circle()
                            .fill(colorScheme == .dark ? Color.white.opacity(0.08) : Color.blue.opacity(0.1))
                    )
            }
        }
        .padding(.top, 8)
    }
    
    private var sessionTypePicker: some View {
        HStack(spacing: 8) {
            ForEach(FocusSession.SessionType.allCases) { type in
                Button {
                    timerVM.setSessionType(type)
                } label: {
                    Text(type.title)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PillButton(isSelected: timerVM.sessionType == type))
            }
        }
    }
    
    private var timerCircleSection: some View {
        ZStack {
            AnimatedCircularProgress(
                progress: timerVM.progress,
                color: timerVM.sessionType.color,
                lineWidth: 12
            )
            .frame(width: 280, height: 280)
            
            VStack(spacing: 8) {
                Text(timerVM.sessionType.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(timerVM.sessionType.color)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        Capsule()
                            .fill(timerVM.sessionType.color.opacity(0.12))
                    )
                
                Text(timerVM.formattedTime)
                    .font(.system(size: 64, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .foregroundColor(.primary)
                    .scaleEffect(timerVM.isRunning ? 1.02 : 1.0)
                    .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: timerVM.isRunning)
                
                Text("剩余时间")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
        .frame(height: 320)
        .padding(.vertical, 16)
    }
    
    private var controlButtons: some View {
        HStack(spacing: 32) {
            Button {
                timerVM.reset()
            } label: {
                Image(systemName: "arrow.counterclockwise")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.secondary)
            }
            .frame(width: 52, height: 52)
            .background(
                Circle()
                    .fill(colorScheme == .dark ? Color.white.opacity(0.08) : Color.gray.opacity(0.1))
            )
            
            Button {
                if timerVM.isRunning {
                    timerVM.pause()
                } else {
                    timerVM.start()
                }
            } label: {
                Image(systemName: timerVM.isRunning ? "pause.fill" : "play.fill")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.white)
                    .offset(x: timerVM.isRunning ? 0 : 2)
            }
            .buttonStyle(PrimaryButton(color: timerVM.sessionType.color, size: CGSize(width: 76, height: 76)))
            
            Button {
                timerVM.skip()
            } label: {
                Image(systemName: "forward.end.fill")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.secondary)
            }
            .frame(width: 52, height: 52)
            .background(
                Circle()
                    .fill(colorScheme == .dark ? Color.white.opacity(0.08) : Color.gray.opacity(0.1))
            )
        }
    }
    
    private var currentTaskSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("当前任务")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.primary)
                
                Spacer()
                
                Button {
                    showTaskPicker = true
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(AppTheme.yellow)
                }
            }
            
            if let task = timerVM.selectedTask {
                selectedTaskCard(task)
            } else {
                noTaskSelectedCard
            }
        }
        .padding(.top, 4)
    }
    
    private func selectedTaskCard(_ task: TodoTask) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: task.category.icon)
                    .font(.system(size: 18))
                    .foregroundColor(task.priority.color)
                    .frame(width: 44, height: 44)
                    .background(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(task.priority.color.opacity(0.12))
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    
                    Text(task.category.title)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Button {
                    timerVM.selectedTask = nil
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.gray.opacity(0.5))
                }
            }
            
            HStack(spacing: 6) {
                ForEach(0..<task.estimatedPomodoros, id: \.self) { i in
                    Image(systemName: i < task.completedPomodoros ? "drop.fill" : "drop")
                        .font(.system(size: 14))
                        .foregroundColor(i < task.completedPomodoros ? AppTheme.blue : Color.gray.opacity(0.3))
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(Color.black.opacity(0.05), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 4)
        )
    }
    
    private var noTaskSelectedCard: some View {
        Button {
            showTaskPicker = true
        } label: {
            HStack {
                Image(systemName: "text.badge.plus")
                    .font(.system(size: 22))
                    .foregroundColor(AppTheme.blue)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("选择一个任务专注")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    Text("点击选择待办事项")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.tertiary)
            }
            .padding(18)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(colorScheme == .dark ? Color.white.opacity(0.05) : Color.blue.opacity(0.04))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .stroke(style: StrokeStyle(lineWidth: 1.5, dash: [8, 6]))
                            .foregroundColor(AppTheme.blue.opacity(0.3))
                    )
            )
        }
        .buttonStyle(.plain)
    }
    
    private var quickStatsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("今日概览")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.primary)
            
            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 2),
                spacing: 12
            ) {
                StatCard(
                    title: "专注时间",
                    value: "\(timerVM.todayFocusMinutes)分",
                    icon: "clock.fill",
                    color: AppTheme.blue
                )
                
                StatCard(
                    title: "完成番茄",
                    value: "\(todayFocusCount)",
                    icon: "drop.fill",
                    color: AppTheme.yellow
                )
                
                StatCard(
                    title: "待完成",
                    value: "\(taskStore.pendingTasks.count)",
                    icon: "list.bullet",
                    color: Color.orange
                )
                
                StatCard(
                    title: "完成率",
                    value: "\(Int(taskStore.completionRate))%",
                    icon: "chart.bar.fill",
                    color: Color.green
                )
            }
        }
        .padding(.top, 4)
    }
    
    private var todayFocusCount: Int {
        let calendar = Calendar.current
        return timerVM.completedSessions.filter {
            $0.type == .focus && calendar.isDateInToday($0.startTime)
        }.count
    }
}

struct TaskPickerView: View {
    @EnvironmentObject var taskStore: TaskStore
    @Binding var selectedTask: TodoTask?
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            List(taskStore.pendingTasks) { task in
                Button {
                    selectedTask = task
                    dismiss()
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: task.category.icon)
                            .font(.system(size: 16))
                            .foregroundColor(task.priority.color)
                            .frame(width: 36, height: 36)
                            .background(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .fill(task.priority.color.opacity(0.15))
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(task.title)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.primary)
                            
                            Text(task.priority.title + "优先级")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        if selectedTask?.id == task.id {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(AppTheme.blue)
                        }
                    }
                    .padding(.vertical, 6)
                }
                .buttonStyle(.plain)
            }
            .listStyle(.plain)
            .navigationTitle("选择任务")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("关闭") {
                        dismiss()
                    }
                    .foregroundColor(AppTheme.blue)
                }
            }
        }
    }
}

struct TimerSettingsView: View {
    @Binding var customMinutes: Double
    var sessionType: FocusSession.SessionType
    var onSave: (Int) -> Void
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("时长")
                            Spacer()
                            Text("\(Int(customMinutes)) 分钟")
                                .font(.system(size: 17, weight: .semibold))
                                .foregroundColor(AppTheme.blue)
                        }
                        
                        Slider(
                            value: $customMinutes,
                            in: 1...90,
                            step: 1
                        )
                        .tint(AppTheme.blue)
                        
                        HStack(spacing: 8) {
                            presetButton(title: "5", minutes: 5)
                            presetButton(title: "15", minutes: 15)
                            presetButton(title: "25", minutes: 25)
                            presetButton(title: "45", minutes: 45)
                            presetButton(title: "60", minutes: 60)
                        }
                    }
                    .padding(.vertical, 8)
                } header: {
                    Text(sessionType.title + "时长设置")
                }
                
                Section {
                    Button {
                        onSave(Int(customMinutes))
                        dismiss()
                    } label: {
                        HStack {
                            Spacer()
                            Text("应用设置")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.black)
                            Spacer()
                        }
                    }
                    .listRowBackground(AppTheme.yellow)
                    .listRowCornerRadius(12)
                }
            }
            .navigationTitle("计时器设置")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                customMinutes = Double(sessionType.defaultDuration / 60)
            }
        }
    }
    
    private func presetButton(title: String, minutes: Int) -> some View {
        Button {
            customMinutes = Double(minutes)
        } label: {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(customMinutes == Double(minutes) ? .white : .primary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(customMinutes == Double(minutes) ? AppTheme.blue : Color.gray.opacity(0.1))
                )
        }
        .buttonStyle(.plain)
    }
}

extension View {
    func listRowCornerRadius(_ radius: CGFloat) -> some View {
        self.listRowInsets(EdgeInsets())
            .listRowBackground(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(AppTheme.yellow)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 2)
            )
    }
}
