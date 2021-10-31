using Microsoft.Web.WebView2.Core;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace MSFSTouchPanel.TouchPanelHost.UI
{
    public partial class PanelForm : Form
    {
        public PanelForm(string format, string planeType, string panel)
        {
            InitializeComponent();

            // Keep form always on top across all active windows
            WindowManager.AlwaysOnTop(this.Handle);

            _ = InitializeAsync(format, planeType, panel);

            this.Text = $"{planeType.ToUpper()} - {panel.ToUpper()}";
        }

        private async Task InitializeAsync(string format, string planeType, string panel)
        {
            CoreWebView2EnvironmentOptions options = new CoreWebView2EnvironmentOptions("--disable-web-security");
            CoreWebView2Environment environment = await CoreWebView2Environment.CreateAsync(null, null, options);
            await webView.EnsureCoreWebView2Async(environment);

            var url = $"http://localhost:5000/{format.ToLower()}/{planeType.ToLower()}/{panel.ToLower()}";
            webView.CoreWebView2.Navigate(url);
        }
    }
}
