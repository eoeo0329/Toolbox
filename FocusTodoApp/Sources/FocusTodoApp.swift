import SwiftUI

@main
struct FocusTodoApp: App {
    @StateObject private var taskStore = TaskStore()
    @StateObject private var timerVM = FocusTimerViewModel()
    @AppStorage("selectedTab") private var selectedTab: Int = 0
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(taskStore)
                .environmentObject(timerVM)
                .tint(AppTheme.blue)
                .preferredColorScheme(nil)
                .onAppear {
                    setupAppearance()
                }
        }
    }
    
    private func setupAppearance() {
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithDefaultBackground()
        tabBarAppearance.backgroundEffect = UIBlurEffect(style: .systemUltraThinMaterial)
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        if #available(iOS 15.0, *) {
            UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
        }
        
        let navBarAppearance = UINavigationBarAppearance()
        navBarAppearance.configureWithDefaultBackground()
        navBarAppearance.backgroundEffect = UIBlurEffect(style: .systemUltraThinMaterial)
        
        UINavigationBar.appearance().standardAppearance = navBarAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navBarAppearance
        UINavigationBar.appearance().compactAppearance = navBarAppearance
        
        UINavigationBar.appearance().tintColor = UIColor(AppTheme.blue)
        
        UITextField.appearance().tintColor = UIColor(AppTheme.blue)
        UITextView.appearance().tintColor = UIColor(AppTheme.blue)
    }
}
