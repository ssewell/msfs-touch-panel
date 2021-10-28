using System;
using Microsoft.Web.WebView2.Core;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace MSFSTouchPanel.TouchPanelHost.UI
{
    public partial class ButtonPanelForm : Form
    {

        public ButtonPanelForm(string format, string planeType, string panel, bool frameOnly)
        {
            InitializeComponent();

            // Keep form always on top across all active windows
            WindowManager.AlwaysOnTop(this.Handle);

            _ = InitializeAsync(format, planeType, panel, frameOnly);
        }

        private async Task InitializeAsync(string format, string planeType, string panel, bool frameOnly)
        {
            CoreWebView2EnvironmentOptions options = new CoreWebView2EnvironmentOptions("--disable-web-security");
            CoreWebView2Environment environment = await CoreWebView2Environment.CreateAsync(null, null, options);
            await webView.EnsureCoreWebView2Async(environment);

            string url;

            switch (format)
            {
                case "buttonpanel":
                case "buttonpanelframeonly":
                    url = $"http://localhost:5000/buttonpanel/{planeType.ToLower()}/{panel.ToLower()}/{Convert.ToInt32(frameOnly)}";
                    webView.CoreWebView2.Navigate(url);
                    break;
                case "winpanel":
                    url = $"http://localhost:5000/webpanel/{planeType.ToLower()}/{panel.ToLower()}";
                    webView.CoreWebView2.Navigate(url);
                    break;
            }
        }
    }
}
