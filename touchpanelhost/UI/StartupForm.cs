using DarkUI.Forms;
using MSFSTouchPanel.Shared;
using MSFSTouchPanel.TouchPanelHost.UI;
using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace MSFSTouchPanel.TouchPanelHost
{
    public partial class StartupForm : DarkForm
    {
        private SynchronizationContext _syncRoot;
        private IWebHost _webHost;

        private G1000PFDForm _pfdForm;
        private G1000MFDForm _mfdForm;

        public StartupForm()
        {
            InitializeComponent();

            _syncRoot = SynchronizationContext.Current;

            // Get server host IP
            var hostName = Dns.GetHostName();
            var hostIp = Dns.GetHostEntry(hostName).AddressList.First(addr => addr.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
            txtServerIP.Text = $"http://{Convert.ToString(hostIp)}:5000";

            Logger.OnServerLogged += HandleOnServerLogged;
            Logger.OnClientLogged += HandleOnClientLogged;

            _webHost = new WebHost(this.Handle);
            _webHost.StartAsync();

            var version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version;
            lblVersion.Text = version.ToString();

            // setup menu events
            menuRestartServer.Click += menuItem_Clicked;
            menuClearClientActionLog.Click += menuItem_Clicked;
            menuClearServerLog.Click += menuItem_Clicked;
            menuLaunchG1000PFD.Click += menuItem_Clicked;
            menuLaunchG1000MFD.Click += menuItem_Clicked;
        }

        public string HostIP
        {
            set { _syncRoot.Post((arg) =>
            {
                var ip = arg as string;
                if (ip != null)
                    txtServerIP.Text = ip;
            }, value); }
        }

        private void HandleOnServerLogged(object sender, EventArgs<string> e)
        {
            if(_syncRoot != null)
                _syncRoot.Post((arg) =>
                {
                    var logMessages = arg as string;

                    if (logMessages != null)
                        if (txtServerLogMessages.Text.Length == 0)
                            txtServerLogMessages.AppendText(logMessages);
                        else
                            txtServerLogMessages.AppendText(Environment.NewLine + logMessages);
                }, e.Value);
        }

        private void HandleOnClientLogged(object sender, EventArgs<string> e)
        {
            if (_syncRoot != null)
                _syncRoot.Post((arg) =>
                {
                    var logMessages = arg as string;
                    if (logMessages != null)
                        if (txtClientLogMessages.Text.Length == 0)
                            txtClientLogMessages.AppendText(logMessages);
                        else
                            txtClientLogMessages.AppendText(Environment.NewLine + logMessages);
                }, e.Value);
        }

        private void StartupForm_Load(object sender, EventArgs e)
        {
            notifyIcon1.BalloonTipText = "Application Minimized";
            notifyIcon1.BalloonTipTitle = "MSFS Touch Panel Server";
        }

        private void StartupForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            _syncRoot = null;
            _webHost.StopAsync();
            _webHost.Dispose();
        }

        private void StartupForm_Resize(object sender, EventArgs e)
        {

            if (this.WindowState == FormWindowState.Minimized)
            {
                if (checkBoxMinimizeToTray.Checked)
                {
                    ShowInTaskbar = false;
                    notifyIcon1.Visible = true;
                    notifyIcon1.ShowBalloonTip(1000);
                }
            }
        }
                private void notifyIcon1_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            ShowInTaskbar = true;
            notifyIcon1.Visible = false;
            WindowState = FormWindowState.Normal;
        }

        private void notifyIcon1_DoubleClick(object sender, EventArgs e)
        {
            ShowInTaskbar = true;
            notifyIcon1.Visible = false;
            WindowState = FormWindowState.Normal;
        }

        private void menuItem_Clicked(object sender, EventArgs e)
        {
            var itemName = ((ToolStripMenuItem)sender).Name;

            switch (itemName)
            {
                case "menuRestartServer":
                    _webHost.RestartAsync();
                    break;
                case "menuClearServerLog":
                    txtServerLogMessages.Clear();
                    break;
                case "menuClearClientActionLog":
                    txtClientLogMessages.Clear();
                    break;
                case "menuLaunchG1000PFD":
                    if(_pfdForm == null || _pfdForm.IsDisposed)
                        _pfdForm = new G1000PFDForm();
                    _pfdForm.Show();
                    break;
                case "menuLaunchG1000MFD":
                    if (_mfdForm == null || _mfdForm.IsDisposed)
                        _mfdForm = new G1000MFDForm();
                    _mfdForm.Show();
                    break;
            }
        }
    }
}
