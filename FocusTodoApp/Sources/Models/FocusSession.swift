import Foundation
import SwiftUI

struct FocusSession: Identifiable, Codable, Hashable {
    var id: UUID = UUID()
    var startTime: Date
    var endTime: Date
    var duration: TimeInterval
    var type: SessionType
    var taskId: UUID?
    var taskTitle: String?
    
    enum SessionType: String, Codable, CaseIterable, Identifiable {
        case focus, shortBreak, longBreak
        var id: String { rawValue }
        
        var title: String {
            switch self {
            case .focus: return "专注"
            case .shortBreak: return "短休息"
            case .longBreak: return "长休息"
            }
        }
        
        var color: Color {
            switch self {
            case .focus: return AppTheme.blue
            case .shortBreak: return AppTheme.yellow
            case .longBreak: return Color.green
            }
        }
        
        var defaultDuration: TimeInterval {
            switch self {
            case .focus: return 25 * 60
            case .shortBreak: return 5 * 60
            case .longBreak: return 15 * 60
            }
        }
    }
    
    var formattedDuration: String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}
