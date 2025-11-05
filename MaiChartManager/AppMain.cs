using System.Diagnostics;
using SingleInstanceCore;
using System.Text.Json;
using Windows.ApplicationModel;
using Windows.ApplicationModel.Activation;
using MaiChartManager.Utils;
using Microsoft.Web.WebView2.Core;
using Xabe.FFmpeg;

namespace MaiChartManager;

public class AppMain : ISingleInstance
{
    public const string Version = "1.6.0";
    public static Browser? BrowserWin { get; set; }

    private Launcher _launcher;

    private static ILoggerFactory _loggerFactory = LoggerFactory.Create(builder =>
    {
        builder.AddConsole();
        builder.SetMinimumLevel(LogLevel.Information);
    });

    public static ILogger GetLogger<T>() => _loggerFactory.CreateLogger<T>();

    public void Run()
    {
        try
        {
            SentrySdk.Init(o =>
                {
                    // Tells which project in Sentry to send events to:
                    o.Dsn = "https://be7a9ae3a9a88f4660737b25894b3c20@sentry.c5y.moe/3";
                    // Set TracesSampleRate to 1.0 to capture 100% of transactions for tracing.
                    // We recommend adjusting this value in production.
                    o.TracesSampleRate = 0.5;
# if DEBUG
                    o.Environment = "development";
# endif
                }
            );

            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.ThrowException);
            ApplicationConfiguration.Initialize();
            FFmpeg.SetExecutablesPath(StaticSettings.exeDir);
            VideoConvert.CheckHardwareAcceleration();

            Directory.CreateDirectory(StaticSettings.appData);
            Directory.CreateDirectory(StaticSettings.tempPath);
            var cfgFilePath = Path.Combine(StaticSettings.appData, "config.json");
            if (File.Exists(cfgFilePath))
            {
                try
                {
                    var cfg = JsonSerializer.Deserialize<Config>(File.ReadAllText(Path.Combine(StaticSettings.appData, "config.json")));
                    if (cfg == null)
                    {
                        throw new Exception("config.json is null");
                    }
                    StaticSettings.Config = cfg;
                }
                catch (Exception e)
                {
                    SentrySdk.CaptureException(e, s => s.TransactionName = "读取配置文件");
                    MessageBox.Show(Locale.ConfigCorrupted, Locale.ConfigCorruptedTitle, MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    File.Delete(cfgFilePath);
                }
            }

            // 初始化语言设置
            if (StaticSettings.Config.Locale == null)
            {
                // 首次启动，从系统语言检测
                var systemCulture = System.Globalization.CultureInfo.CurrentUICulture;
                StaticSettings.CurrentLocale = systemCulture.TwoLetterISOLanguageName == "zh" ? "zh" : "en";
                StaticSettings.Config.Locale = StaticSettings.CurrentLocale;
                // 保存配置
                try
                {
                    var json = JsonSerializer.Serialize(StaticSettings.Config, new JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(cfgFilePath, json);
                }
                catch (Exception e)
                {
                    _loggerFactory.CreateLogger<AppMain>().LogError(e, "保存配置文件失败");
                }
            }
            else
            {
                StaticSettings.CurrentLocale = StaticSettings.Config.Locale;
            }

            // 设置当前线程的 Culture
            var culture = new System.Globalization.CultureInfo(StaticSettings.CurrentLocale == "zh" ? "zh-CN" : "en-US");
            System.Globalization.CultureInfo.CurrentCulture = culture;
            System.Globalization.CultureInfo.CurrentUICulture = culture;

            string? availableVersion = null;
            try
            {
                availableVersion = CoreWebView2Environment.GetAvailableBrowserVersionString();
            }
            catch (WebView2RuntimeNotFoundException) { }

            if (availableVersion == null && !IsFromStartup)
            {
                var answer = MessageBox.Show(Locale.WebView2NotInstalled, Locale.WebView2NotInstalledTitle, MessageBoxButtons.YesNo,
                    MessageBoxIcon.Warning);
                if (answer == DialogResult.Yes)
                {
                    Process.Start(new ProcessStartInfo(Path.Combine(StaticSettings.exeDir, "MicrosoftEdgeWebview2Setup.exe")) { UseShellExecute = true });
                }
            }

            IapManager.Init();

            _launcher = new Launcher();

            Application.Run();
        }
        catch (Exception e)
        {
            SentrySdk.CaptureException(e);
            MessageBox.Show(e.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            throw;
        }
    }

    private static bool? _isFromStartup;

    public static bool IsFromStartup
    {
        get
        {
            if (_isFromStartup.HasValue)
                return _isFromStartup.Value;
            try
            {
                var aeArgs = AppInstance.GetActivatedEventArgs();
                _isFromStartup = aeArgs?.Kind == ActivationKind.StartupTask;
                return _isFromStartup.Value;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                SentrySdk.CaptureException(e);
            }

            _isFromStartup = false;
            return false;
        }
    }

    public void OnInstanceInvoked(string[] args)
    {
        _launcher.ShowWindow();
    }
}