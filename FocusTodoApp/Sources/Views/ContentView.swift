import SwiftUI

struct ContentView: View {
    @EnvironmentObject var timerVM: FocusTimerViewModel
    @EnvironmentObject var taskStore: TaskStore
    @State private var selectedTab: Tab = .timer
    
    enum Tab: Int, CaseIterable {
        case timer = 0
        case tasks = 1
        case stats = 2
        
        var title: String {
            switch self {
            case .timer: return "专注"
            case .tasks: return "任务"
            case .stats: return "统计"
            }
        }
        
        var icon: String {
            switch self {
            case .timer: return "timer"
            case .tasks: return "checklist"
            case .stats: return "chart.bar.fill"
            }
        }
        
        var selectedIcon: String {
            switch self {
            case .timer: return "timer.fill"
            case .tasks: return "checklist.checked"
            case .stats: return "chart.bar.fill"
            }
        }
    }
    
    var body: some View {
        TabView(selection: $selectedTab) {
            FocusTimerView()
                .tabItem {
                    Image(systemName: selectedTab == .timer ? Tab.timer.selectedIcon : Tab.timer.icon)
                    Text(Tab.timer.title)
                }
                .tag(Tab.timer)
            
            TaskListView()
                .tabItem {
                    Image(systemName: selectedTab == .tasks ? Tab.tasks.selectedIcon : Tab.tasks.icon)
                    Text(Tab.tasks.title)
                }
                .tag(Tab.tasks)
                .badge(taskStore.pendingTasks.isEmpty ? nil : taskStore.pendingTasks.count)
            
            StatsView()
                .tabItem {
                    Image(systemName: Tab.stats.icon)
                    Text(Tab.stats.title)
                }
                .tag(Tab.stats)
        }
        .overlay(alignment: .bottom) {
            floatingTimerBadge
        }
    }
    
    @ViewBuilder
    private var floatingTimerBadge: some View {
        if timerVM.isRunning && selectedTab != .timer {
            Button {
                withAnimation(.easeInOut(duration: 0.25)) {
                    selectedTab = .timer
                }
            } label: {
                HStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .trim(from: 0, to: CGFloat(min(timerVM.progress, 1.0)))
                            .stroke(
                                timerVM.sessionType.color,
                                style: StrokeStyle(lineWidth: 2.5, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))
                            .frame(width: 28, height: 28)
                        
                        Circle()
                            .fill(timerVM.sessionType.color.opacity(0.15))
                            .frame(width: 24, height: 24)
                        
                        Image(systemName: timerVM.isRunning ? "pause.fill" : "play.fill")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(timerVM.sessionType.color)
                    }
                    
                    VStack(alignment: .leading, spacing: 0) {
                        Text(timerVM.sessionType.title + "中")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.secondary)
                        
                        Text(timerVM.formattedTime)
                            .font(.system(size: 15, weight: .bold, design: .rounded))
                            .monospacedDigit()
                            .foregroundColor(.primary)
                    }
                    
                    if let task = timerVM.selectedTask {
                        Text(task.title)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                            .frame(maxWidth: 100)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.up.circle.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(timerVM.sessionType.color, timerVM.sessionType.color.opacity(0.15))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(
                    Capsule()
                        .fill(.ultraThinMaterial)
                        .overlay(
                            Capsule()
                                .stroke(Color.white.opacity(0.3), lineWidth: 0.5)
                        )
                        .shadow(color: Color.black.opacity(0.12), radius: 20, x: 0, y: 8)
                )
                .padding(.horizontal, 16)
                .padding(.bottom, 90)
            }
            .buttonStyle(.plain)
            .transition(.asymmetric(
                insertion: .move(edge: .bottom).combined(with: .opacity),
                removal: .move(edge: .bottom).combined(with: .opacity)
            ))
            .animation(.easeInOut(duration: 0.3), value: timerVM.isRunning)
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(TaskStore())
        .environmentObject(FocusTimerViewModel())
}
