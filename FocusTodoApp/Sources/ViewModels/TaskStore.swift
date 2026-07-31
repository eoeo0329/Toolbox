import Foundation
import SwiftUI
import Combine

@MainActor
class TaskStore: ObservableObject {
    @Published var tasks: [TodoTask] = []
    @Published var selectedCategory: TodoTask.Category?
    @Published var sortOrder: SortOrder = .dueDate
    
    enum SortOrder: String, CaseIterable {
        case dueDate = "截止日期"
        case priority = "优先级"
        case createdAt = "创建时间"
        case title = "标题"
    }
    
    private let saveKey = "FocusTodo_Tasks"
    
    init() {
        loadTasks()
        if tasks.isEmpty {
            addSampleData()
        }
    }
    
    var filteredTasks: [TodoTask] {
        var result = tasks
        if let category = selectedCategory {
            result = result.filter { $0.category == category }
        }
        return sortedTasks(result)
    }
    
    var pendingTasks: [TodoTask] {
        filteredTasks.filter { !$0.isCompleted }
    }
    
    var completedTasks: [TodoTask] {
        filteredTasks.filter { $0.isCompleted }
    }
    
    var todayTasks: [TodoTask] {
        let calendar = Calendar.current
        return pendingTasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return calendar.isDateInToday(dueDate)
        }
    }
    
    private func sortedTasks(_ tasks: [TodoTask]) -> [TodoTask] {
        tasks.sorted { a, b in
            switch sortOrder {
            case .dueDate:
                let aDate = a.dueDate ?? Date.distantFuture
                let bDate = b.dueDate ?? Date.distantFuture
                return aDate < bDate
            case .priority:
                let priorityOrder: [TodoTask.Priority] = [.urgent, .high, .medium, .low]
                guard let aIndex = priorityOrder.firstIndex(of: a.priority),
                      let bIndex = priorityOrder.firstIndex(of: b.priority) else { return false }
                return aIndex < bIndex
            case .createdAt:
                return a.createdAt > b.createdAt
            case .title:
                return a.title < b.title
            }
        }
    }
    
    func addTask(_ task: TodoTask) {
        tasks.append(task)
        saveTasks()
    }
    
    func updateTask(_ task: TodoTask) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index] = task
            saveTasks()
        }
    }
    
    func deleteTask(_ task: TodoTask) {
        tasks.removeAll { $0.id == task.id }
        saveTasks()
    }
    
    func toggleComplete(_ task: TodoTask) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index].isCompleted.toggle()
            saveTasks()
        }
    }
    
    func incrementPomodoro(for task: TodoTask) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index].completedPomodoros += 1
            saveTasks()
        }
    }
    
    var completionRate: Double {
        guard !tasks.isEmpty else { return 0 }
        return Double(completedTasks.count) / Double(tasks.count) * 100
    }
    
    var totalPomodoros: Int {
        tasks.reduce(0) { $0 + $1.completedPomodoros }
    }
    
    private func saveTasks() {
        if let encoded = try? JSONEncoder().encode(tasks) {
            UserDefaults.standard.set(encoded, forKey: saveKey)
        }
    }
    
    private func loadTasks() {
        if let data = UserDefaults.standard.data(forKey: saveKey),
           let decoded = try? JSONDecoder().decode([TodoTask].self, from: data) {
            tasks = decoded
        }
    }
    
    private func addSampleData() {
        let now = Date()
        let calendar = Calendar.current
        
        tasks = [
            TodoTask(
                title: "完成项目设计文档",
                description: "整理项目架构设计，输出详细文档",
                priority: .high,
                dueDate: calendar.date(byAdding: .hour, value: 4, to: now),
                estimatedPomodoros: 4,
                completedPomodoros: 2,
                category: .work
            ),
            TodoTask(
                title: "阅读 SwiftUI 动画章节",
                description: "学习 SwiftUI 的动画原理和最佳实践",
                priority: .medium,
                dueDate: calendar.date(byAdding: .day, value: 1, to: now),
                estimatedPomodoros: 2,
                category: .study
            ),
            TodoTask(
                title: "晨间锻炼 30 分钟",
                description: "跑步 + 力量训练",
                priority: .low,
                dueDate: calendar.date(byAdding: .hour, value: -1, to: now),
                estimatedPomodoros: 1,
                completedPomodoros: 1,
                category: .health
            ),
            TodoTask(
                title: "紧急修复线上 Bug",
                description: "用户反馈的支付流程问题",
                priority: .urgent,
                dueDate: calendar.date(byAdding: .hour, value: 2, to: now),
                estimatedPomodoros: 3,
                category: .work
            ),
            TodoTask(
                title: "周末旅行规划",
                description: "预订酒店和行程安排",
                isCompleted: true,
                priority: .low,
                estimatedPomodoros: 1,
                category: .personal
            )
        ]
        saveTasks()
    }
}
