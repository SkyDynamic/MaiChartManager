using System.Globalization;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace MaiChartManager.Controllers.App;

[ApiController]
[Route("MaiChartManagerServlet/[action]Api")]
public class LocaleController(StaticSettings settings, ILogger<LocaleController> logger) : ControllerBase
{
    [HttpGet]
    public string GetCurrentLocale()
    {
        return StaticSettings.CurrentLocale;
    }

    [HttpPost]
    public void SetLocale([FromBody] string locale)
    {
        if (locale != "zh" && locale != "zh-TW" && locale != "en")
        {
            throw new ArgumentException("Invalid locale. Must be 'zh', 'zh-TW', or 'en'");
        }

        StaticSettings.CurrentLocale = locale;
        StaticSettings.Config.Locale = locale;
        
        // 设置 Locale 资源管理器的 Culture（这会影响所有线程）
        var culture = locale switch
        {
            "zh" => new CultureInfo("zh-CN"),
            "zh-TW" => new CultureInfo("zh-TW"),
            _ => new CultureInfo("en-US")
        };
        Locale.Culture = culture;
        CultureInfo.CurrentCulture = culture;
        CultureInfo.CurrentUICulture = culture;
        
        // 保存配置文件
        try
        {
            var cfgFilePath = Path.Combine(StaticSettings.appData, "config.json");
            var json = JsonSerializer.Serialize(StaticSettings.Config, new JsonSerializerOptions { WriteIndented = true });
            System.IO.File.WriteAllText(cfgFilePath, json);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "保存配置文件失败");
            throw;
        }
    }
}