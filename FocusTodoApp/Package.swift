// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "FocusTodoApp",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "FocusTodoApp",
            targets: ["FocusTodoApp"]
        ),
    ],
    targets: [
        .target(
            name: "FocusTodoApp",
            path: "Sources",
            resources: [
                .process("Resources/Assets.xcassets")
            ]
        ),
    ]
)
