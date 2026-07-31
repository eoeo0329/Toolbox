import Foundation
import SwiftUI

struct TodoTask: Identifiable, Codable, Hashable {
    var id: UUID = UUID()
    var title: String
    var description: String
    var isCompleted: Bool = false
    var priority: Priority = .medium
    var createdAt: Date = Date()
    var dueDate: Date?
    var estimatedPomodoros: Int = 1
    var completedPomodoros: Int = 0
    var category: Category = .work
    
    enum Priority: String, Codable, CaseIterable, Identifiable {
        case low, medium, high, urgent
        var id: String { rawValue }
        
        var title: String {
            switch self {
            case .low: return "低"
            case .medium: return "中"
            case .high: return "高"
            case .urgent: return "紧急"
            }
        }
        
        var color: Color {
            switch self {
            case .low: return .gray
            case .medium: return AppTheme.blue
            case .high: return AppTheme.yellow
            case .urgent: return .red
            }
        }
    }
    
    enum Category: String, Codable, CaseIterable, Identifiable {
        case work, study, personal, health, other
        var id: String { rawValue }
        
        var title: String {
            switch self {
            case .work: return "工作"
            case .study: return "学习"
            case .personal: return "个人"
            case .health: return "健康"
            case .other: return "其他"
            }
        }
        
        var icon: String {
            switch self {
            case .work: return "briefcase.fill"
            case .study: return "book.fill"
            case .personal: return "person.fill"
            case .health: return "heart.fill"
            case .other: return "square.grid.2x2.fill"
            }
        }
    }
}
