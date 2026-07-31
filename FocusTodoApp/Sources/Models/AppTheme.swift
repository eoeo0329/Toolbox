import SwiftUI

struct AppTheme {
    static let primary = Color.black
    static let secondary = Color.white
    static let blue = Color(red: 0.0, green: 0.48, blue: 1.0)
    static let yellow = Color(red: 1.0, green: 0.84, blue: 0.0)
    static let background = Color.white
    static let surface = Color(red: 0.97, green: 0.97, blue: 0.98)
    static let textPrimary = Color.black
    static let textSecondary = Color.gray
    
    struct Dark {
        static let background = Color.black
        static let surface = Color(red: 0.11, green: 0.11, blue: 0.12)
        static let textPrimary = Color.white
        static let textSecondary = Color.gray
    }
}

extension Color {
    static let appPrimary = AppTheme.primary
    static let appSecondary = AppTheme.secondary
    static let appBlue = AppTheme.blue
    static let appYellow = AppTheme.yellow
    static let appBackground = AppTheme.background
    static let appSurface = AppTheme.surface
}

struct AppGradient {
    static let header = LinearGradient(
        colors: [AppTheme.blue, AppTheme.blue.opacity(0.8)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let focus = LinearGradient(
        colors: [AppTheme.blue, AppTheme.blue.opacity(0.6)],
        startPoint: .top,
        endPoint: .bottom
    )
    
    static let button = LinearGradient(
        colors: [AppTheme.yellow, AppTheme.yellow.opacity(0.8)],
        startPoint: .top,
        endPoint: .bottom
    )
    
    static let card = LinearGradient(
        colors: [.white, Color(red: 0.98, green: 0.98, blue: 0.99)],
        startPoint: .top,
        endPoint: .bottom
    )
}
