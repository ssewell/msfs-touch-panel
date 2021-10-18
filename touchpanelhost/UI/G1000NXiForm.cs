using Microsoft.Web.WebView2.Core;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace MSFSTouchPanel.TouchPanelHost.UI
{
    public partial class G1000NXiForm : Form
    {

        public G1000NXiForm(string function)
        {
            InitializeComponent();

            // Keep form always on top across all active windows
            WindowManager.AlwaysOnTop(this.Handle);

            _ = InitializeAsync(function);
        }

        private async Task InitializeAsync(string function)
        {
            CoreWebView2EnvironmentOptions options = new CoreWebView2EnvironmentOptions("--disable-web-security");
            CoreWebView2Environment environment = await CoreWebView2Environment.CreateAsync(null, null, options);
            await webView.EnsureCoreWebView2Async(environment);
            webView.CoreWebView2.Navigate("http://localhost:5000/" + function.ToLower());
        }
    }
}
