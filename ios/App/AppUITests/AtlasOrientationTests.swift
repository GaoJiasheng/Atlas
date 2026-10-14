import XCTest

/// Rotate the physical simulator display, rather than resizing an iPadOS 26 window.
final class AtlasOrientationTests: XCTestCase {
    func testLandscape() {
        XCUIDevice.shared.orientation = .landscapeLeft
        let app = XCUIApplication(bundleIdentifier: "pub.gavin.atlas")
        app.activate()
        XCTAssertEqual(XCUIDevice.shared.orientation, .landscapeLeft)
    }

    func testFullScreenMode() {
        let settings = XCUIApplication(bundleIdentifier: "com.apple.Preferences")
        settings.launch()
        settings.buttons["com.apple.settings.multitaskingAndGestures"].tap()
        let fullScreen = settings.buttons["com.apple.settings.multitaskingAndGestures.fullScreenApps"]
        fullScreen.tap()
        XCTAssertTrue(fullScreen.isSelected)
        XCUIApplication(bundleIdentifier: "pub.gavin.atlas").activate()
    }

    func testPortrait() {
        XCUIDevice.shared.orientation = .portrait
        XCUIApplication(bundleIdentifier: "pub.gavin.atlas").activate()
        XCTAssertEqual(XCUIDevice.shared.orientation, .portrait)
    }
}
