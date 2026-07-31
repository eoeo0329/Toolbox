import Foundation
import SwiftUI
import Combine
import AVFoundation

@MainActor
class FocusTimerViewModel: ObservableObject {
    @Published var sessionType: FocusSession.SessionType = .focus
    @Published var timeRemaining: TimeInterval = 25 * 60
    @Published var totalDuration: TimeInterval = 25 * 60
    @Published var isRunning: Bool = false
    @Published var completedSessions: [FocusSession] = []
    @Published var focusCount: Int = 0
    @Published var selectedTask: TodoTask?
    @Published var showCompletionAlert: Bool = false
    
    private var timer: Timer?
    private var sessionStart: Date?
    private let saveKey = "FocusTodo_Sessions"
    
    var focusMinutes: Int {
        let totalSeconds = completedSessions
            .filter { $0.type == .focus }
            .reduce(0) { $0 + $1.duration }
        return Int(totalSeconds / 60)
    }
    
    var todayFocusMinutes: Int {
        let calendar = Calendar.current
        return Int(completedSessions
            .filter { $0.type == .focus && calendar.isDateInToday($0.startTime) }
            .reduce(0) { $0 + $1.duration } / 60)
    }
    
    var weekFocusMinutes: Int {
        let calendar = Calendar.current
        let weekAgo = calendar.date(byAdding: .day, value: -7, to: Date())!
        return Int(completedSessions
            .filter { $0.type == .focus && $0.startTime >= weekAgo }
            .reduce(0) { $0 + $1.duration } / 60)
    }
    
    var progress: Double {
        guard totalDuration > 0 else { return 0 }
        return 1 - (timeRemaining / totalDuration)
    }
    
    var formattedTime: String {
        let minutes = Int(timeRemaining) / 60
        let seconds = Int(timeRemaining) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
    
    var formattedHoursMinutes: String {
        let hours = Int(focusMinutes) / 60
        let minutes = Int(focusMinutes) % 60
        if hours > 0 {
            return "\(hours)小时\(minutes)分钟"
        }
        return "\(minutes)分钟"
    }
    
    init() {
        loadSessions()
        timeRemaining = sessionType.defaultDuration
        totalDuration = sessionType.defaultDuration
    }
    
    func setSessionType(_ type: FocusSession.SessionType) {
        sessionType = type
        timeRemaining = type.defaultDuration
        totalDuration = type.defaultDuration
        isRunning = false
        timer?.invalidate()
        timer = nil
    }
    
    func start() {
        guard !isRunning else { return }
        isRunning = true
        sessionStart = Date()
        
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
        RunLoop.main.add(timer!, forMode: .common)
    }
    
    func pause() {
        isRunning = false
        timer?.invalidate()
        timer = nil
    }
    
    func reset() {
        pause()
        timeRemaining = sessionType.defaultDuration
        totalDuration = sessionType.defaultDuration
        sessionStart = nil
    }
    
    func skip() {
        completeSession(completed: false)
    }
    
    private func tick() {
        guard isRunning else { return }
        if timeRemaining > 0 {
            timeRemaining -= 1
        } else {
            completeSession(completed: true)
        }
    }
    
    private func completeSession(completed: Bool) {
        pause()
        
        if let start = sessionStart {
            let actualDuration = completed ? totalDuration : (totalDuration - timeRemaining)
            let session = FocusSession(
                startTime: start,
                endTime: Date(),
                duration: actualDuration,
                type: sessionType,
                taskId: selectedTask?.id,
                taskTitle: selectedTask?.title
            )
            completedSessions.insert(session, at: 0)
            saveSessions()
            
            if sessionType == .focus && completed {
                focusCount += 1
                if let task = selectedTask {
                    NotificationCenter.default.post(
                        name: .incrementPomodoro,
                        object: task.id
                    )
                }
            }
            
            if completed {
                playCompletionSound()
                showCompletionAlert = true
                autoAdvanceSession()
            }
        }
        
        sessionStart = nil
    }
    
    private func autoAdvanceSession() {
        switch sessionType {
        case .focus:
            if focusCount % 4 == 0 {
                setSessionType(.longBreak)
            } else {
                setSessionType(.shortBreak)
            }
        case .shortBreak, .longBreak:
            setSessionType(.focus)
        }
    }
    
    private func playCompletionSound() {
        let systemSoundID: SystemSoundID = 1005
        AudioServicesPlaySystemSound(systemSoundID)
    }
    
    func setCustomDuration(minutes: Int) {
        let duration = TimeInterval(max(1, minutes) * 60)
        timeRemaining = duration
        totalDuration = duration
    }
    
    var sessionsByDay: [Date: [FocusSession]] {
        let calendar = Calendar.current
        return Dictionary(grouping: completedSessions) { session in
            calendar.startOfDay(for: session.startTime)
        }
    }
    
    var last7DaysStats: [(date: Date, minutes: Int)] {
        let calendar = Calendar.current
        var result: [(date: Date, minutes: Int)] = []
        
        for dayOffset in 0..<7 {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: Date()) else { continue }
            let startOfDay = calendar.startOfDay(for: date)
            let daySessions = completedSessions.filter { session in
                calendar.isDate(session.startTime, inSameDayAs: startOfDay) && session.type == .focus
            }
            let minutes = Int(daySessions.reduce(0) { $0 + $1.duration } / 60)
            result.append((date: startOfDay, minutes: minutes))
        }
        
        return result.reversed()
    }
    
    private func saveSessions() {
        if let encoded = try? JSONEncoder().encode(completedSessions) {
            UserDefaults.standard.set(encoded, forKey: saveKey)
        }
    }
    
    private func loadSessions() {
        if let data = UserDefaults.standard.data(forKey: saveKey),
           let decoded = try? JSONDecoder().decode([FocusSession].self, from: data) {
            completedSessions = decoded
            focusCount = completedSessions.filter { $0.type == .focus }.count
        }
    }
}

extension Notification.Name {
    static let incrementPomodoro = Notification.Name("incrementPomodoro")
}
