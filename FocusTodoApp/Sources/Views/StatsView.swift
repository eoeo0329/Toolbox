import SwiftUI

struct StatsView: View {
    @EnvironmentObject var timerVM: FocusTimerViewModel
    @EnvironmentObject var taskStore: TaskStore
    @Environment(\.colorScheme) var colorScheme
    
    @State private var selectedRange: TimeRange = .week
    
    enum TimeRange: String, CaseIterable {
        case today = "今日"
        case week = "本周"
        case month = "本月"
        case all = "全部"
        
        var days: Int {
            switch self {
            case .today: return 1
            case .week: return 7
            case .month: return 30
            case .all: return 365
            }
        }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                backgroundLayer
                
                ScrollView {
                    VStack(spacing: 24) {
                        headerSection
                        rangePicker
                        summaryCards
                        weeklyChartSection
                        categoryBreakdown
                        recentSessions
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
                .padding(.top, 8)
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
    
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("数据统计")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                Text("记录你的每一份专注")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding(.top, 8)
    }
    
    private var rangePicker: some View {
        HStack(spacing: 6) {
            ForEach(TimeRange.allCases, id: \.self) { range in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedRange = range
                    }
                } label: {
                    Text(range.rawValue)
                        .font(.system(size: 13, weight: .semibold))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(PillButton(isSelected: selectedRange == range))
            }
        }
    }
    
    private var summaryCards: some View {
        VStack(spacing: 16) {
            HStack(spacing: 12) {
                bigStatCard(
                    title: "专注时长",
                    value: formattedTotalMinutes,
                    subtitle: "总专注时间",
                    icon: "clock.fill",
                    color: AppTheme.blue,
                    progress: focusProgress
                )
                
                bigStatCard(
                    title: "番茄数量",
                    value: "\(totalFocusSessions)",
                    subtitle: "完成的番茄",
                    icon: "drop.fill",
                    color: AppTheme.yellow,
                    progress: pomodoroProgress
                )
            }
            
            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 2),
                spacing: 12
            ) {
                StatCard(
                    title: "完成任务",
                    value: "\(completedTasksInRange)",
                    icon: "checkmark.circle.fill",
                    color: Color.green
                )
                
                StatCard(
                    title: "任务总数",
                    value: "\(tasksInRange)",
                    icon: "list.bullet.clipboard",
                    color: Color.orange
                )
                
                StatCard(
                    title: "平均专注",
                    value: averageFocusTime,
                    icon: "hourglass",
                    color: Color.purple
                )
                
                StatCard(
                    title: "完成率",
                    value: "\(Int(completionRate))%",
                    icon: "chart.pie.fill",
                    color: Color.pink
                )
            }
        }
    }
    
    private func bigStatCard(title: String, value: String, subtitle: String, icon: String, color: Color, progress: Double) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(color)
                    .frame(width: 40, height: 40)
                    .background(
                        Circle()
                            .fill(color.opacity(0.15))
                    )
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.secondary)
                    
                    Text(subtitle)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.tertiary)
                }
            }
            
            Text(value)
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            
            AnimatedProgressBar(
                progress: progress,
                color: color,
                height: 6
            )
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(Color.black.opacity(0.05), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.05), radius: 16, x: 0, y: 6)
        )
    }
    
    private var weeklyChartSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("专注趋势")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("近7天")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            WeeklyChartView(data: timerVM.last7DaysStats)
                .padding(.top, 8)
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(Color.black.opacity(0.05), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 4)
        )
    }
    
    private var categoryBreakdown: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("分类统计")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.primary)
                
                Spacer()
            }
            
            VStack(spacing: 14) {
                ForEach(categoryStats) { stat in
                    categoryRow(stat)
                }
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(Color.black.opacity(0.05), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 4)
        )
    }
    
    private func categoryRow(_ stat: CategoryStat) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                Image(systemName: stat.category.icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(stat.color)
                    .frame(width: 32, height: 32)
                    .background(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(stat.color.opacity(0.15))
                    )
                
                Text(stat.category.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("\(stat.count) 个任务")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            AnimatedProgressBar(
                progress: categoryTotal > 0 ? Double(stat.count) / Double(categoryTotal) : 0,
                color: stat.color,
                height: 7
            )
        }
    }
    
    struct CategoryStat: Identifiable {
        let id = UUID()
        let category: TodoTask.Category
        let count: Int
        let color: Color
    }
    
    private var categoryStats: [CategoryStat] {
        let colors: [TodoTask.Category: Color] = [
            .work: AppTheme.blue,
            .study: AppTheme.yellow,
            .personal: Color.purple,
            .health: Color.green,
            .other: Color.orange
        ]
        
        return TodoTask.Category.allCases.map { category in
            CategoryStat(
                category: category,
                count: taskStore.tasks.filter { $0.category == category }.count,
                color: colors[category] ?? .gray
            )
        }.sorted { $0.count > $1.count }
    }
    
    private var categoryTotal: Int {
        categoryStats.reduce(0) { $0 + $1.count }
    }
    
    private var recentSessions: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("最近记录")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.primary)
                
                Spacer()
            }
            
            if timerVM.completedSessions.isEmpty {
                emptySessionsView
            } else {
                LazyVStack(spacing: 10) {
                    ForEach(Array(timerVM.completedSessions.prefix(8))) { session in
                        sessionRow(session)
                    }
                }
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(Color.black.opacity(0.05), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 4)
        )
    }
    
    private var emptySessionsView: some View {
        HStack {
            Spacer()
            
            VStack(spacing: 10) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 40))
                    .foregroundColor(.gray.opacity(0.4))
                
                Text("还没有专注记录")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.secondary)
                
                Text("开始你的第一个番茄钟吧")
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(.tertiary)
            }
            .padding(.vertical, 24)
            
            Spacer()
        }
    }
    
    private func sessionRow(_ session: FocusSession) -> some View {
        HStack(spacing: 12) {
            Image(systemName: session.type == .focus ? "drop.fill" : "cup.and.saucer.fill")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(session.type.color)
                .frame(width: 36, height: 36)
                .background(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(session.type.color.opacity(0.15))
                )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(session.taskTitle ?? session.type.title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.primary)
                    .lineLimit(1)
                
                Text(formatSessionTime(session.startTime))
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(session.formattedDuration)
                    .font(.system(size: 15, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .foregroundColor(session.type.color)
                
                Text(session.type.title)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(colorScheme == .dark ? Color.white.opacity(0.04) : Color.gray.opacity(0.04))
        )
    }
    
    private func formatSessionTime(_ date: Date) -> String {
        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        
        if calendar.isDateInToday(date) {
            formatter.dateFormat = "今天 HH:mm"
        } else if calendar.isDateInYesterday(date) {
            formatter.dateFormat = "昨天 HH:mm"
        } else {
            formatter.dateFormat = "M月d日 HH:mm"
        }
        return formatter.string(from: date)
    }
    
    private var sessionsInRange: [FocusSession] {
        let calendar = Calendar.current
        let now = Date()
        
        switch selectedRange {
        case .today:
            return timerVM.completedSessions.filter { calendar.isDateInToday($0.startTime) }
        case .week:
            guard let weekAgo = calendar.date(byAdding: .day, value: -7, to: now) else { return [] }
            return timerVM.completedSessions.filter { $0.startTime >= weekAgo }
        case .month:
            guard let monthAgo = calendar.date(byAdding: .day, value: -30, to: now) else { return [] }
            return timerVM.completedSessions.filter { $0.startTime >= monthAgo }
        case .all:
            return timerVM.completedSessions
        }
    }
    
    private var tasksInRange: Int {
        let calendar = Calendar.current
        let now = Date()
        
        switch selectedRange {
        case .today:
            return taskStore.tasks.filter { calendar.isDateInToday($0.createdAt) }.count
        case .week:
            guard let weekAgo = calendar.date(byAdding: .day, value: -7, to: now) else { return taskStore.tasks.count }
            return taskStore.tasks.filter { $0.createdAt >= weekAgo }.count
        case .month:
            guard let monthAgo = calendar.date(byAdding: .day, value: -30, to: now) else { return taskStore.tasks.count }
            return taskStore.tasks.filter { $0.createdAt >= monthAgo }.count
        case .all:
            return taskStore.tasks.count
        }
    }
    
    private var completedTasksInRange: Int {
        let calendar = Calendar.current
        let now = Date()
        
        let tasks: [TodoTask]
        switch selectedRange {
        case .today:
            tasks = taskStore.completedTasks.filter {
                guard let completedDate = $0.createdAt.addingTimeInterval(3600) as Date? else { return false }
                return calendar.isDateInToday(completedDate)
            }
        case .week:
            guard let weekAgo = calendar.date(byAdding: .day, value: -7, to: now) else { return taskStore.completedTasks.count }
            tasks = taskStore.completedTasks.filter { $0.createdAt >= weekAgo }
        case .month:
            guard let monthAgo = calendar.date(byAdding: .day, value: -30, to: now) else { return taskStore.completedTasks.count }
            tasks = taskStore.completedTasks.filter { $0.createdAt >= monthAgo }
        case .all:
            tasks = taskStore.completedTasks
        }
        return tasks.count
    }
    
    private var totalFocusSessions: Int {
        sessionsInRange.filter { $0.type == .focus }.count
    }
    
    private var totalMinutes: Int {
        Int(sessionsInRange
            .filter { $0.type == .focus }
            .reduce(0) { $0 + $1.duration } / 60)
    }
    
    private var formattedTotalMinutes: String {
        let hours = totalMinutes / 60
        let mins = totalMinutes % 60
        if hours > 0 {
            return "\(hours)h\(mins)m"
        }
        return "\(mins)分钟"
    }
    
    private var averageFocusTime: String {
        let focusSessions = sessionsInRange.filter { $0.type == .focus }
        guard !focusSessions.isEmpty else { return "0分钟" }
        let avg = Int(focusSessions.reduce(0) { $0 + $1.duration } / TimeInterval(focusSessions.count) / 60)
        return "\(avg)分钟"
    }
    
    private var completionRate: Double {
        guard tasksInRange > 0 else { return 0 }
        return Double(completedTasksInRange) / Double(tasksInRange) * 100
    }
    
    private var focusProgress: Double {
        let target: Double
        switch selectedRange {
        case .today: target = 120
        case .week: target = 840
        case .month: target = 3600
        case .all: target = Double(totalMinutes) + 100
        }
        return min(Double(totalMinutes) / target, 1.0)
    }
    
    private var pomodoroProgress: Double {
        let target: Double
        switch selectedRange {
        case .today: target = 8
        case .week: target = 56
        case .month: target = 240
        case .all: target = Double(totalFocusSessions) + 10
        }
        return min(Double(totalFocusSessions) / target, 1.0)
    }
}

struct WeeklyChartView: View {
    let data: [(date: Date, minutes: Int)]
    @Environment(\.colorScheme) var colorScheme
    
    private let barWidth: CGFloat = 30
    private let maxBarHeight: CGFloat = 140
    
    @State private var animatedHeights: [CGFloat] = []
    
    private var maxMinutes: Int {
        max(data.map { $0.minutes }.max() ?? 1, 60)
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack(alignment: .bottom, spacing: 10) {
                ForEach(0..<data.count, id: \.self) { index in
                    let item = data[index]
                    let heightRatio = CGFloat(item.minutes) / CGFloat(maxMinutes)
                    
                    VStack(spacing: 6) {
                        Text("\(item.minutes)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(item.minutes > 0 ? AppTheme.blue : .secondary.opacity(0.5))
                            .frame(height: 14)
                        
                        ZStack(alignment: .bottom) {
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .fill(colorScheme == .dark ? Color.white.opacity(0.06) : Color.gray.opacity(0.12))
                                .frame(width: barWidth, height: maxBarHeight)
                            
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [AppTheme.blue, AppTheme.blue.opacity(0.7), AppTheme.yellow],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                                .frame(
                                    width: barWidth,
                                    height: animatedHeights.indices.contains(index) ? animatedHeights[index] : 0
                                )
                                .shadow(color: AppTheme.blue.opacity(0.3), radius: 4, y: 2)
                        }
                        .frame(width: barWidth, height: maxBarHeight)
                        
                        Text(dayAbbreviation(item.date))
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(isToday(item.date) ? AppTheme.blue : .secondary)
                    }
                }
            }
            
            Divider()
                .opacity(0.3)
            
            HStack {
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("每日目标: 120分钟 (2小时)")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                    
                    Text("最高记录: \(maxMinutes)分钟")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(AppTheme.yellow)
                }
            }
        }
        .onAppear {
            animateBars()
        }
        .onChange(of: data) { _ in
            animateBars()
        }
    }
    
    private func animateBars() {
        animatedHeights = Array(repeating: 0, count: data.count)
        
        for index in 0..<data.count {
            let heightRatio = CGFloat(data[index].minutes) / CGFloat(maxMinutes)
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * 0.08) {
                withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                    animatedHeights[index] = heightRatio * maxBarHeight
                }
            }
        }
    }
    
    private func dayAbbreviation(_ date: Date) -> String {
        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_CN")
        
        if calendar.isDateInToday(date) {
            return "今天"
        }
        
        let weekday = calendar.component(.weekday, from: date)
        let weekdays = ["日", "一", "二", "三", "四", "五", "六"]
        return "周" + weekdays[weekday - 1]
    }
    
    private func isToday(_ date: Date) -> Bool {
        Calendar.current.isDateInToday(date)
    }
}
