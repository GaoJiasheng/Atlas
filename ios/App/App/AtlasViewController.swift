import Capacitor
import WebKit
import UniformTypeIdentifiers

/// Astro emits one index.html per directory, rather than an SPA entry point.
struct AtlasDirectoryRouter: Router {
    var basePath = ""

    func route(for path: String) -> String {
        let root = URL(fileURLWithPath: basePath).standardizedFileURL
        let file = root.appendingPathComponent(path).standardizedFileURL
        guard file.path == root.path || file.path.hasPrefix(root.path + "/") else { return root.path + "/__missing__" }
        var isDirectory: ObjCBool = false
        if FileManager.default.fileExists(atPath: file.path, isDirectory: &isDirectory), isDirectory.boolValue {
            return file.appendingPathComponent("index.html").path
        }
        return file.path
    }
}

/// Static bundle responses carry a native-only CSP, including blob workers for MapLibre.
final class AtlasBundleHandler: NSObject, WKURLSchemeHandler {
    private let router = AtlasDirectoryRouter(basePath: Bundle.main.resourceURL!.appendingPathComponent("public").path)
    private let policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; media-src 'self' blob:; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'self'"

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url, url.host == "localhost",
              !url.path.hasPrefix("/_capacitor_") else {
            task.didFailWithError(URLError(.unsupportedURL)); return
        }
        let file = URL(fileURLWithPath: router.route(for: url.path))
        do {
            let data = try Data(contentsOf: file, options: .mappedIfSafe)
            let mime = UTType(filenameExtension: file.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
            let headers = ["Content-Type": mime, "Content-Security-Policy": policy, "Cache-Control": "no-cache"]
            task.didReceive(HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: headers)!)
            task.didReceive(data)
            task.didFinish()
        } catch {
            task.didFailWithError(error)
        }
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

/// Prevent source links from escaping into Safari or a remote WKWebView page.
@objc(AtlasOfflineNavigation)
final class AtlasOfflineNavigation: CAPPlugin, CAPBridgedPlugin {
    let identifier = "AtlasOfflineNavigation"
    let jsName = "AtlasOfflineNavigation"
    let pluginMethods: [CAPPluginMethod] = []

    override func shouldOverrideLoad(_ navigationAction: WKNavigationAction) -> NSNumber? {
        guard let url = navigationAction.request.url,
              url.scheme == "capacitor", url.host == "localhost",
              !url.path.hasPrefix("/_capacitor_") else { return true }
        return nil
    }
}

/// Capacitor's native HTTP bridge would bypass the web response CSP.
@objc(AtlasOfflineHTTP)
final class AtlasOfflineHTTP: CAPPlugin, CAPBridgedPlugin {
    let identifier = "AtlasOfflineHTTP"
    let jsName = "CapacitorHttp"
    let pluginMethods: [CAPPluginMethod] = ["request", "get", "post", "put", "patch", "delete"].compactMap {
        CAPPluginMethod(name: $0, returnType: CAPPluginReturnPromise)
    }
    @objc func request(_ call: CAPPluginCall) { call.reject("Atlas only reads bundled assets") }
    @objc func get(_ call: CAPPluginCall) { request(call) }
    @objc func post(_ call: CAPPluginCall) { request(call) }
    @objc func put(_ call: CAPPluginCall) { request(call) }
    @objc func patch(_ call: CAPPluginCall) { request(call) }
    @objc func delete(_ call: CAPPluginCall) { request(call) }
}

final class AtlasViewController: CAPBridgeViewController, WKScriptMessageHandler, WKUIDelegate {
    override func router() -> Router { AtlasDirectoryRouter() }

    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        // WKWebView rejects replacing an already registered scheme handler.
        let bundled = WKWebViewConfiguration()
        bundled.userContentController = configuration.userContentController
        bundled.websiteDataStore = configuration.websiteDataStore
        bundled.preferences = configuration.preferences
        bundled.defaultWebpagePreferences = configuration.defaultWebpagePreferences
        bundled.applicationNameForUserAgent = configuration.applicationNameForUserAgent
        bundled.allowsInlineMediaPlayback = configuration.allowsInlineMediaPlayback
        bundled.mediaTypesRequiringUserActionForPlayback = configuration.mediaTypesRequiringUserActionForPlayback
        bundled.setURLSchemeHandler(AtlasBundleHandler(), forURLScheme: "capacitor")
        return super.webView(with: frame, configuration: bundled)
    }

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(AtlasOfflineNavigation())
        bridge?.registerPluginInstance(AtlasOfflineHTTP())
        webView?.uiDelegate = self
        statusBarStyle = .darkContent
        webView?.scrollView.bounces = false
        webView?.configuration.userContentController.add(self, name: "atlasTheme")
        let source = """
        // OS speech is outside CSP: expose and use only already installed local voices.
        if ('speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const voices = synth.getVoices.bind(synth);
          const speak = synth.speak.bind(synth);
          synth.getVoices = () => voices().filter(v => v.localService === true);
          synth.speak = utterance => {
            const local = synth.getVoices();
            if (utterance.voice?.localService !== true) {
              const lang = (utterance.lang || document.documentElement.lang || 'en').split('-')[0];
              utterance.voice = local.find(v => v.lang.split('-')[0] === lang) || null;
            }
            if (utterance.voice?.localService === true) speak(utterance);
          };
          synth.getVoices(); // WebKit enumerates voices asynchronously on iPadOS 26.
        }
        document.addEventListener('DOMContentLoaded', () => {
          const update = () => window.webkit.messageHandlers.atlasTheme.postMessage(document.documentElement.dataset.theme || 'paper');
          new MutationObserver(update).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
          update();
        });
        """
        webView?.configuration.userContentController.addUserScript(WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        #if DEBUG
        if ProcessInfo.processInfo.environment["ATLAS_QA_SCRIPT"] != nil {
            let capture = """
            window.__ipadErrors = [];
            window.addEventListener('error', e => window.__ipadErrors.push(e.message || String(e.target?.src || e.target?.href || 'resource error')), true);
            window.addEventListener('unhandledrejection', e => window.__ipadErrors.push(String(e.reason)));
            """
            webView?.configuration.userContentController.addUserScript(WKUserScript(source: capture, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }
        #endif
    }

    override func viewDidLoad() {
        // The scheme handler supplies the offline CSP on the very first response.
        loadBundledSite()
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url, url.scheme == "capacitor", url.host == "localhost" {
            webView.load(navigationAction.request)
        }
        return nil
    }

    private func loadBundledSite() {
        super.viewDidLoad()
        #if DEBUG
        // Simulator-only inspection: environment variables are never accepted in Release.
        if let path = ProcessInfo.processInfo.environment["ATLAS_QA_PATH"], path.hasPrefix("/") {
            webView?.load(URLRequest(url: URL(string: "capacitor://localhost" + path)!))
        }
        if let script = ProcessInfo.processInfo.environment["ATLAS_QA_SCRIPT"] {
            DispatchQueue.main.asyncAfter(deadline: .now() + 15) { [weak self] in
                self?.webView?.callAsyncJavaScript(script, arguments: ["nativeOrientation": self?.view.window?.windowScene?.interfaceOrientation.rawValue ?? 0], in: nil, in: .page) { result in
                    let value: String
                    switch result {
                    case .success(let data): value = String(describing: data)
                    case .failure(let error): value = "{\"nativeError\":\"\(error.localizedDescription)\"}"
                    }
                    let file = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("ipad-qa.json")
                    try? value.write(to: file, atomically: true, encoding: .utf8)
                }
            }
        }
        #endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        statusBarStyle = (message.body as? String) == "cinema" ? .lightContent : .darkContent
        setNeedsStatusBarAppearanceUpdate()
    }
}
