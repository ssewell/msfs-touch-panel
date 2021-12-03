
namespace MSFSTouchPanel.TouchPanelHost
{
    partial class StartupForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(StartupForm));
            this.notifyIcon1 = new System.Windows.Forms.NotifyIcon(this.components);
            this.checkBoxMinimizeToTray = new DarkUI.Controls.DarkCheckBox();
            this.darkLabel1 = new DarkUI.Controls.DarkLabel();
            this.lblVersion = new DarkUI.Controls.DarkLabel();
            this.darkLabel2 = new DarkUI.Controls.DarkLabel();
            this.darkLabel3 = new DarkUI.Controls.DarkLabel();
            this.darkLabel4 = new DarkUI.Controls.DarkLabel();
            this.darkMenuStrip1 = new DarkUI.Controls.DarkMenuStrip();
            this.menuServer = new System.Windows.Forms.ToolStripMenuItem();
            this.menuRestartServer = new System.Windows.Forms.ToolStripMenuItem();
            this.menuLog = new System.Windows.Forms.ToolStripMenuItem();
            this.menuClearClientActionLog = new System.Windows.Forms.ToolStripMenuItem();
            this.menuClearServerLog = new System.Windows.Forms.ToolStripMenuItem();
            this.menuExperimental = new System.Windows.Forms.ToolStripMenuItem();
            this.framePanelToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.g1000NXiToolStripMenuItem3 = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_framepanel_g1000nxi_pfd = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_framepanel_g1000nxi_mfd = new System.Windows.Forms.ToolStripMenuItem();
            this.buttonsWebPanelToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.g1000NXiToolStripMenuItem2 = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_buttonpanel_g1000nxi_pfd = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_buttonpanel_g1000nxi_mfd = new System.Windows.Forms.ToolStripMenuItem();
            this.webPanelToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.g1000NXiToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_g1000nxi_pfd = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_g1000nxi_mfd = new System.Windows.Forms.ToolStripMenuItem();
            this.asoboCJ4ToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_cj4_pfd = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_cj4_mfd = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_cj4_fmc = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_cj4_sai = new System.Windows.Forms.ToolStripMenuItem();
            this.flyByWireA32NXToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_pfd_template_1 = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_nd_template_1 = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_eicas_1 = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_eicas_2 = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_cdu = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_dcdu = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_isis = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_fcu = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_webpanel_fbwa32nx_rmp = new System.Windows.Forms.ToolStripMenuItem();
            this.txtServerIP = new DarkUI.Controls.DarkTextBox();
            this.txtClientLogMessages = new DarkUI.Controls.DarkTextBox();
            this.txtServerLogMessages = new DarkUI.Controls.DarkTextBox();
            this.a32NXToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_framepanel_fbwa32nx_cdu = new System.Windows.Forms.ToolStripMenuItem();
            this.a32NXToolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.menu_buttonpanel_fbwa32nx_cdu = new System.Windows.Forms.ToolStripMenuItem();
            this.darkMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // notifyIcon1
            // 
            this.notifyIcon1.Icon = ((System.Drawing.Icon)(resources.GetObject("notifyIcon1.Icon")));
            this.notifyIcon1.Text = "notifyIcon1";
            this.notifyIcon1.Visible = true;
            this.notifyIcon1.DoubleClick += new System.EventHandler(this.notifyIcon1_DoubleClick);
            // 
            // checkBoxMinimizeToTray
            // 
            this.checkBoxMinimizeToTray.AutoSize = true;
            this.checkBoxMinimizeToTray.Font = new System.Drawing.Font("Segoe UI", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point);
            this.checkBoxMinimizeToTray.Location = new System.Drawing.Point(26, 519);
            this.checkBoxMinimizeToTray.Name = "checkBoxMinimizeToTray";
            this.checkBoxMinimizeToTray.Size = new System.Drawing.Size(189, 24);
            this.checkBoxMinimizeToTray.TabIndex = 11;
            this.checkBoxMinimizeToTray.Text = "Minimize to System Tray";
            // 
            // darkLabel1
            // 
            this.darkLabel1.AutoSize = true;
            this.darkLabel1.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.darkLabel1.Location = new System.Drawing.Point(533, 533);
            this.darkLabel1.Name = "darkLabel1";
            this.darkLabel1.Size = new System.Drawing.Size(45, 15);
            this.darkLabel1.TabIndex = 12;
            this.darkLabel1.Text = "Version";
            // 
            // lblVersion
            // 
            this.lblVersion.AutoSize = true;
            this.lblVersion.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.lblVersion.Location = new System.Drawing.Point(584, 533);
            this.lblVersion.Name = "lblVersion";
            this.lblVersion.Size = new System.Drawing.Size(45, 15);
            this.lblVersion.TabIndex = 13;
            this.lblVersion.Text = "version";
            // 
            // darkLabel2
            // 
            this.darkLabel2.AutoSize = true;
            this.darkLabel2.Font = new System.Drawing.Font("Segoe UI", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point);
            this.darkLabel2.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.darkLabel2.Location = new System.Drawing.Point(25, 40);
            this.darkLabel2.Name = "darkLabel2";
            this.darkLabel2.Size = new System.Drawing.Size(80, 20);
            this.darkLabel2.TabIndex = 14;
            this.darkLabel2.Text = "Server URL";
            // 
            // darkLabel3
            // 
            this.darkLabel3.AutoSize = true;
            this.darkLabel3.Font = new System.Drawing.Font("Segoe UI", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point);
            this.darkLabel3.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.darkLabel3.Location = new System.Drawing.Point(26, 72);
            this.darkLabel3.Name = "darkLabel3";
            this.darkLabel3.Size = new System.Drawing.Size(123, 20);
            this.darkLabel3.TabIndex = 15;
            this.darkLabel3.Text = "Client Action Log";
            // 
            // darkLabel4
            // 
            this.darkLabel4.AutoSize = true;
            this.darkLabel4.Font = new System.Drawing.Font("Segoe UI", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point);
            this.darkLabel4.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.darkLabel4.Location = new System.Drawing.Point(26, 294);
            this.darkLabel4.Name = "darkLabel4";
            this.darkLabel4.Size = new System.Drawing.Size(79, 20);
            this.darkLabel4.TabIndex = 16;
            this.darkLabel4.Text = "Server Log";
            // 
            // darkMenuStrip1
            // 
            this.darkMenuStrip1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.darkMenuStrip1.Font = new System.Drawing.Font("Segoe UI", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point);
            this.darkMenuStrip1.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.darkMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menuServer,
            this.menuLog,
            this.menuExperimental});
            this.darkMenuStrip1.Location = new System.Drawing.Point(0, 0);
            this.darkMenuStrip1.Name = "darkMenuStrip1";
            this.darkMenuStrip1.Padding = new System.Windows.Forms.Padding(3, 2, 0, 2);
            this.darkMenuStrip1.Size = new System.Drawing.Size(1147, 28);
            this.darkMenuStrip1.TabIndex = 17;
            this.darkMenuStrip1.Text = "darkMenuStrip1";
            // 
            // menuServer
            // 
            this.menuServer.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menuServer.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menuRestartServer});
            this.menuServer.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menuServer.Name = "menuServer";
            this.menuServer.Size = new System.Drawing.Size(62, 24);
            this.menuServer.Text = "Server";
            // 
            // menuRestartServer
            // 
            this.menuRestartServer.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menuRestartServer.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menuRestartServer.Name = "menuRestartServer";
            this.menuRestartServer.Size = new System.Drawing.Size(169, 24);
            this.menuRestartServer.Text = "Restart Server";
            // 
            // menuLog
            // 
            this.menuLog.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menuLog.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menuClearClientActionLog,
            this.menuClearServerLog});
            this.menuLog.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menuLog.Name = "menuLog";
            this.menuLog.Size = new System.Drawing.Size(46, 24);
            this.menuLog.Text = "Log";
            // 
            // menuClearClientActionLog
            // 
            this.menuClearClientActionLog.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menuClearClientActionLog.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menuClearClientActionLog.Name = "menuClearClientActionLog";
            this.menuClearClientActionLog.Size = new System.Drawing.Size(230, 24);
            this.menuClearClientActionLog.Text = "Clear Client Action Log";
            // 
            // menuClearServerLog
            // 
            this.menuClearServerLog.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menuClearServerLog.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menuClearServerLog.Name = "menuClearServerLog";
            this.menuClearServerLog.Size = new System.Drawing.Size(230, 24);
            this.menuClearServerLog.Text = "Clear Server Log";
            // 
            // menuExperimental
            // 
            this.menuExperimental.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menuExperimental.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.framePanelToolStripMenuItem,
            this.buttonsWebPanelToolStripMenuItem,
            this.webPanelToolStripMenuItem});
            this.menuExperimental.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menuExperimental.Name = "menuExperimental";
            this.menuExperimental.Size = new System.Drawing.Size(175, 24);
            this.menuExperimental.Text = "Exeperimental Features";
            // 
            // framePanelToolStripMenuItem
            // 
            this.framePanelToolStripMenuItem.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.framePanelToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.g1000NXiToolStripMenuItem3,
            this.a32NXToolStripMenuItem});
            this.framePanelToolStripMenuItem.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.framePanelToolStripMenuItem.Name = "framePanelToolStripMenuItem";
            this.framePanelToolStripMenuItem.Size = new System.Drawing.Size(195, 24);
            this.framePanelToolStripMenuItem.Text = "Frame Panel";
            // 
            // g1000NXiToolStripMenuItem3
            // 
            this.g1000NXiToolStripMenuItem3.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.g1000NXiToolStripMenuItem3.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menu_framepanel_g1000nxi_pfd,
            this.menu_framepanel_g1000nxi_mfd});
            this.g1000NXiToolStripMenuItem3.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.g1000NXiToolStripMenuItem3.Name = "g1000NXiToolStripMenuItem3";
            this.g1000NXiToolStripMenuItem3.Size = new System.Drawing.Size(180, 24);
            this.g1000NXiToolStripMenuItem3.Text = "G1000NXi";
            // 
            // menu_framepanel_g1000nxi_pfd
            // 
            this.menu_framepanel_g1000nxi_pfd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_framepanel_g1000nxi_pfd.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_framepanel_g1000nxi_pfd.Name = "menu_framepanel_g1000nxi_pfd";
            this.menu_framepanel_g1000nxi_pfd.Size = new System.Drawing.Size(180, 24);
            this.menu_framepanel_g1000nxi_pfd.Text = "PFD";
            // 
            // menu_framepanel_g1000nxi_mfd
            // 
            this.menu_framepanel_g1000nxi_mfd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_framepanel_g1000nxi_mfd.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_framepanel_g1000nxi_mfd.Name = "menu_framepanel_g1000nxi_mfd";
            this.menu_framepanel_g1000nxi_mfd.Size = new System.Drawing.Size(180, 24);
            this.menu_framepanel_g1000nxi_mfd.Text = "MFD";
            // 
            // buttonsWebPanelToolStripMenuItem
            // 
            this.buttonsWebPanelToolStripMenuItem.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.buttonsWebPanelToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.g1000NXiToolStripMenuItem2,
            this.a32NXToolStripMenuItem1});
            this.buttonsWebPanelToolStripMenuItem.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.buttonsWebPanelToolStripMenuItem.Name = "buttonsWebPanelToolStripMenuItem";
            this.buttonsWebPanelToolStripMenuItem.Size = new System.Drawing.Size(195, 24);
            this.buttonsWebPanelToolStripMenuItem.Text = "Button Web Panel";
            // 
            // g1000NXiToolStripMenuItem2
            // 
            this.g1000NXiToolStripMenuItem2.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.g1000NXiToolStripMenuItem2.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menu_buttonpanel_g1000nxi_pfd,
            this.menu_buttonpanel_g1000nxi_mfd});
            this.g1000NXiToolStripMenuItem2.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.g1000NXiToolStripMenuItem2.Name = "g1000NXiToolStripMenuItem2";
            this.g1000NXiToolStripMenuItem2.Size = new System.Drawing.Size(158, 24);
            this.g1000NXiToolStripMenuItem2.Text = "G1000NXi";
            // 
            // menu_buttonpanel_g1000nxi_pfd
            // 
            this.menu_buttonpanel_g1000nxi_pfd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_buttonpanel_g1000nxi_pfd.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_buttonpanel_g1000nxi_pfd.Name = "menu_buttonpanel_g1000nxi_pfd";
            this.menu_buttonpanel_g1000nxi_pfd.Size = new System.Drawing.Size(180, 24);
            this.menu_buttonpanel_g1000nxi_pfd.Text = "PFD";
            // 
            // menu_buttonpanel_g1000nxi_mfd
            // 
            this.menu_buttonpanel_g1000nxi_mfd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_buttonpanel_g1000nxi_mfd.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_buttonpanel_g1000nxi_mfd.Name = "menu_buttonpanel_g1000nxi_mfd";
            this.menu_buttonpanel_g1000nxi_mfd.Size = new System.Drawing.Size(180, 24);
            this.menu_buttonpanel_g1000nxi_mfd.Text = "MFD";
            // 
            // webPanelToolStripMenuItem
            // 
            this.webPanelToolStripMenuItem.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.webPanelToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.g1000NXiToolStripMenuItem,
            this.asoboCJ4ToolStripMenuItem,
            this.flyByWireA32NXToolStripMenuItem});
            this.webPanelToolStripMenuItem.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.webPanelToolStripMenuItem.Name = "webPanelToolStripMenuItem";
            this.webPanelToolStripMenuItem.Size = new System.Drawing.Size(195, 24);
            this.webPanelToolStripMenuItem.Text = "Web Panel";
            // 
            // g1000NXiToolStripMenuItem
            // 
            this.g1000NXiToolStripMenuItem.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.g1000NXiToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menu_webpanel_g1000nxi_pfd,
            this.menu_webpanel_g1000nxi_mfd});
            this.g1000NXiToolStripMenuItem.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.g1000NXiToolStripMenuItem.Name = "g1000NXiToolStripMenuItem";
            this.g1000NXiToolStripMenuItem.Size = new System.Drawing.Size(193, 24);
            this.g1000NXiToolStripMenuItem.Text = "G1000NXi";
            // 
            // menu_webpanel_g1000nxi_pfd
            // 
            this.menu_webpanel_g1000nxi_pfd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_g1000nxi_pfd.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_g1000nxi_pfd.Name = "menu_webpanel_g1000nxi_pfd";
            this.menu_webpanel_g1000nxi_pfd.Size = new System.Drawing.Size(109, 24);
            this.menu_webpanel_g1000nxi_pfd.Text = "PFD";
            // 
            // menu_webpanel_g1000nxi_mfd
            // 
            this.menu_webpanel_g1000nxi_mfd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_g1000nxi_mfd.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_g1000nxi_mfd.Name = "menu_webpanel_g1000nxi_mfd";
            this.menu_webpanel_g1000nxi_mfd.Size = new System.Drawing.Size(109, 24);
            this.menu_webpanel_g1000nxi_mfd.Text = "MFD";
            // 
            // asoboCJ4ToolStripMenuItem
            // 
            this.asoboCJ4ToolStripMenuItem.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.asoboCJ4ToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menu_webpanel_cj4_pfd,
            this.menu_webpanel_cj4_mfd,
            this.menu_webpanel_cj4_fmc,
            this.menu_webpanel_cj4_sai});
            this.asoboCJ4ToolStripMenuItem.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.asoboCJ4ToolStripMenuItem.Name = "asoboCJ4ToolStripMenuItem";
            this.asoboCJ4ToolStripMenuItem.Size = new System.Drawing.Size(193, 24);
            this.asoboCJ4ToolStripMenuItem.Text = "Asobo CJ4";
            // 
            // menu_webpanel_cj4_pfd
            // 
            this.menu_webpanel_cj4_pfd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_cj4_pfd.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_cj4_pfd.Name = "menu_webpanel_cj4_pfd";
            this.menu_webpanel_cj4_pfd.Size = new System.Drawing.Size(109, 24);
            this.menu_webpanel_cj4_pfd.Text = "PFD";
            // 
            // menu_webpanel_cj4_mfd
            // 
            this.menu_webpanel_cj4_mfd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_cj4_mfd.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_cj4_mfd.Name = "menu_webpanel_cj4_mfd";
            this.menu_webpanel_cj4_mfd.Size = new System.Drawing.Size(109, 24);
            this.menu_webpanel_cj4_mfd.Text = "MFD";
            // 
            // menu_webpanel_cj4_fmc
            // 
            this.menu_webpanel_cj4_fmc.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_cj4_fmc.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_cj4_fmc.Name = "menu_webpanel_cj4_fmc";
            this.menu_webpanel_cj4_fmc.Size = new System.Drawing.Size(109, 24);
            this.menu_webpanel_cj4_fmc.Text = "FMC";
            // 
            // menu_webpanel_cj4_sai
            // 
            this.menu_webpanel_cj4_sai.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_cj4_sai.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_cj4_sai.Name = "menu_webpanel_cj4_sai";
            this.menu_webpanel_cj4_sai.Size = new System.Drawing.Size(109, 24);
            this.menu_webpanel_cj4_sai.Text = "SAI";
            // 
            // flyByWireA32NXToolStripMenuItem
            // 
            this.flyByWireA32NXToolStripMenuItem.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.flyByWireA32NXToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menu_webpanel_fbwa32nx_pfd_template_1,
            this.menu_webpanel_fbwa32nx_nd_template_1,
            this.menu_webpanel_fbwa32nx_eicas_1,
            this.menu_webpanel_fbwa32nx_eicas_2,
            this.menu_webpanel_fbwa32nx_cdu,
            this.menu_webpanel_fbwa32nx_dcdu,
            this.menu_webpanel_fbwa32nx_isis,
            this.menu_webpanel_fbwa32nx_fcu,
            this.menu_webpanel_fbwa32nx_rmp});
            this.flyByWireA32NXToolStripMenuItem.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.flyByWireA32NXToolStripMenuItem.Name = "flyByWireA32NXToolStripMenuItem";
            this.flyByWireA32NXToolStripMenuItem.Size = new System.Drawing.Size(193, 24);
            this.flyByWireA32NXToolStripMenuItem.Text = "FlyByWire A32NX";
            // 
            // menu_webpanel_fbwa32nx_pfd_template_1
            // 
            this.menu_webpanel_fbwa32nx_pfd_template_1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_pfd_template_1.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_pfd_template_1.Name = "menu_webpanel_fbwa32nx_pfd_template_1";
            this.menu_webpanel_fbwa32nx_pfd_template_1.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_pfd_template_1.Text = "PFD";
            // 
            // menu_webpanel_fbwa32nx_nd_template_1
            // 
            this.menu_webpanel_fbwa32nx_nd_template_1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_nd_template_1.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_nd_template_1.Name = "menu_webpanel_fbwa32nx_nd_template_1";
            this.menu_webpanel_fbwa32nx_nd_template_1.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_nd_template_1.Text = "ND";
            // 
            // menu_webpanel_fbwa32nx_eicas_1
            // 
            this.menu_webpanel_fbwa32nx_eicas_1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_eicas_1.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_eicas_1.Name = "menu_webpanel_fbwa32nx_eicas_1";
            this.menu_webpanel_fbwa32nx_eicas_1.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_eicas_1.Text = "EICAS_1";
            // 
            // menu_webpanel_fbwa32nx_eicas_2
            // 
            this.menu_webpanel_fbwa32nx_eicas_2.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_eicas_2.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_eicas_2.Name = "menu_webpanel_fbwa32nx_eicas_2";
            this.menu_webpanel_fbwa32nx_eicas_2.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_eicas_2.Text = "EICAS_2";
            // 
            // menu_webpanel_fbwa32nx_cdu
            // 
            this.menu_webpanel_fbwa32nx_cdu.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_cdu.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_cdu.Name = "menu_webpanel_fbwa32nx_cdu";
            this.menu_webpanel_fbwa32nx_cdu.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_cdu.Text = "MCDU";
            // 
            // menu_webpanel_fbwa32nx_dcdu
            // 
            this.menu_webpanel_fbwa32nx_dcdu.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_dcdu.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_dcdu.Name = "menu_webpanel_fbwa32nx_dcdu";
            this.menu_webpanel_fbwa32nx_dcdu.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_dcdu.Text = "DCDU";
            // 
            // menu_webpanel_fbwa32nx_isis
            // 
            this.menu_webpanel_fbwa32nx_isis.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_isis.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_isis.Name = "menu_webpanel_fbwa32nx_isis";
            this.menu_webpanel_fbwa32nx_isis.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_isis.Text = "ISIS";
            // 
            // menu_webpanel_fbwa32nx_fcu
            // 
            this.menu_webpanel_fbwa32nx_fcu.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_fcu.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_fcu.Name = "menu_webpanel_fbwa32nx_fcu";
            this.menu_webpanel_fbwa32nx_fcu.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_fcu.Text = "FCU";
            // 
            // menu_webpanel_fbwa32nx_rmp
            // 
            this.menu_webpanel_fbwa32nx_rmp.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_webpanel_fbwa32nx_rmp.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_webpanel_fbwa32nx_rmp.Name = "menu_webpanel_fbwa32nx_rmp";
            this.menu_webpanel_fbwa32nx_rmp.Size = new System.Drawing.Size(180, 24);
            this.menu_webpanel_fbwa32nx_rmp.Text = "RMP";
            // 
            // txtServerIP
            // 
            this.txtServerIP.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(69)))), ((int)(((byte)(73)))), ((int)(((byte)(74)))));
            this.txtServerIP.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtServerIP.Font = new System.Drawing.Font("Segoe UI", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point);
            this.txtServerIP.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.txtServerIP.Location = new System.Drawing.Point(115, 38);
            this.txtServerIP.Name = "txtServerIP";
            this.txtServerIP.ReadOnly = true;
            this.txtServerIP.Size = new System.Drawing.Size(336, 27);
            this.txtServerIP.TabIndex = 18;
            // 
            // txtClientLogMessages
            // 
            this.txtClientLogMessages.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(69)))), ((int)(((byte)(73)))), ((int)(((byte)(74)))));
            this.txtClientLogMessages.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtClientLogMessages.Font = new System.Drawing.Font("Consolas", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point);
            this.txtClientLogMessages.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.txtClientLogMessages.Location = new System.Drawing.Point(26, 95);
            this.txtClientLogMessages.Multiline = true;
            this.txtClientLogMessages.Name = "txtClientLogMessages";
            this.txtClientLogMessages.ReadOnly = true;
            this.txtClientLogMessages.Size = new System.Drawing.Size(1091, 180);
            this.txtClientLogMessages.TabIndex = 19;
            // 
            // txtServerLogMessages
            // 
            this.txtServerLogMessages.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(69)))), ((int)(((byte)(73)))), ((int)(((byte)(74)))));
            this.txtServerLogMessages.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtServerLogMessages.Font = new System.Drawing.Font("Consolas", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point);
            this.txtServerLogMessages.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.txtServerLogMessages.Location = new System.Drawing.Point(26, 317);
            this.txtServerLogMessages.Multiline = true;
            this.txtServerLogMessages.Name = "txtServerLogMessages";
            this.txtServerLogMessages.ReadOnly = true;
            this.txtServerLogMessages.Size = new System.Drawing.Size(1091, 180);
            this.txtServerLogMessages.TabIndex = 20;
            // 
            // a32NXToolStripMenuItem
            // 
            this.a32NXToolStripMenuItem.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.a32NXToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menu_framepanel_fbwa32nx_cdu});
            this.a32NXToolStripMenuItem.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.a32NXToolStripMenuItem.Name = "a32NXToolStripMenuItem";
            this.a32NXToolStripMenuItem.Size = new System.Drawing.Size(180, 24);
            this.a32NXToolStripMenuItem.Text = "FBW A32NX";
            // 
            // menu_framepanel_fbwa32nx_cdu
            // 
            this.menu_framepanel_fbwa32nx_cdu.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_framepanel_fbwa32nx_cdu.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_framepanel_fbwa32nx_cdu.Name = "menu_framepanel_fbwa32nx_cdu";
            this.menu_framepanel_fbwa32nx_cdu.Size = new System.Drawing.Size(180, 24);
            this.menu_framepanel_fbwa32nx_cdu.Text = "MCDU";
            // 
            // a32NXToolStripMenuItem1
            // 
            this.a32NXToolStripMenuItem1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.a32NXToolStripMenuItem1.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menu_buttonpanel_fbwa32nx_cdu});
            this.a32NXToolStripMenuItem1.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.a32NXToolStripMenuItem1.Name = "a32NXToolStripMenuItem1";
            this.a32NXToolStripMenuItem1.Size = new System.Drawing.Size(158, 24);
            this.a32NXToolStripMenuItem1.Text = "FBW A32NX";
            // 
            // menu_buttonpanel_fbwa32nx_cdu
            // 
            this.menu_buttonpanel_fbwa32nx_cdu.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(60)))), ((int)(((byte)(63)))), ((int)(((byte)(65)))));
            this.menu_buttonpanel_fbwa32nx_cdu.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(220)))), ((int)(((byte)(220)))), ((int)(((byte)(220)))));
            this.menu_buttonpanel_fbwa32nx_cdu.Name = "menu_buttonpanel_fbwa32nx_cdu";
            this.menu_buttonpanel_fbwa32nx_cdu.Size = new System.Drawing.Size(180, 24);
            this.menu_buttonpanel_fbwa32nx_cdu.Text = "MCDU";
            // 
            // StartupForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1147, 555);
            this.Controls.Add(this.txtServerLogMessages);
            this.Controls.Add(this.txtClientLogMessages);
            this.Controls.Add(this.txtServerIP);
            this.Controls.Add(this.darkLabel4);
            this.Controls.Add(this.darkLabel3);
            this.Controls.Add(this.darkLabel2);
            this.Controls.Add(this.lblVersion);
            this.Controls.Add(this.darkLabel1);
            this.Controls.Add(this.checkBoxMinimizeToTray);
            this.Controls.Add(this.darkMenuStrip1);
            this.DoubleBuffered = true;
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MainMenuStrip = this.darkMenuStrip1;
            this.MaximizeBox = false;
            this.Name = "StartupForm";
            this.Text = "MSFS Touch Panel Server";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.StartupForm_FormClosing);
            this.Load += new System.EventHandler(this.StartupForm_Load);
            this.Resize += new System.EventHandler(this.StartupForm_Resize);
            this.darkMenuStrip1.ResumeLayout(false);
            this.darkMenuStrip1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.NotifyIcon notifyIcon1;
        private DarkUI.Controls.DarkCheckBox checkBoxMinimizeToTray;
        private DarkUI.Controls.DarkLabel darkLabel1;
        private DarkUI.Controls.DarkLabel lblVersion;
        private DarkUI.Controls.DarkLabel darkLabel2;
        private DarkUI.Controls.DarkLabel darkLabel3;
        private DarkUI.Controls.DarkLabel darkLabel4;
        private DarkUI.Controls.DarkMenuStrip darkMenuStrip1;
        private System.Windows.Forms.ToolStripMenuItem menuServer;
        private System.Windows.Forms.ToolStripMenuItem menuLog;
        private System.Windows.Forms.ToolStripMenuItem menuExperimental;
        private System.Windows.Forms.ToolStripMenuItem menuRestartServer;
        private System.Windows.Forms.ToolStripMenuItem menuClearClientActionLog;
        private System.Windows.Forms.ToolStripMenuItem menuClearServerLog;
        private DarkUI.Controls.DarkTextBox txtServerIP;
        private DarkUI.Controls.DarkTextBox txtClientLogMessages;
        private DarkUI.Controls.DarkTextBox txtServerLogMessages;
        private System.Windows.Forms.ToolStripMenuItem webPanelToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem g1000NXiToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_g1000nxi_pfd;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_g1000nxi_mfd;
        private System.Windows.Forms.ToolStripMenuItem buttonsWebPanelToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem g1000NXiToolStripMenuItem2;
        private System.Windows.Forms.ToolStripMenuItem menu_buttonpanel_g1000nxi_pfd;
        private System.Windows.Forms.ToolStripMenuItem menu_buttonpanel_g1000nxi_mfd;
        private System.Windows.Forms.ToolStripMenuItem asoboCJ4ToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_cj4_pfd;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_cj4_mfd;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_cj4_fmc;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_cj4_sai;
        private System.Windows.Forms.ToolStripMenuItem framePanelToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem g1000NXiToolStripMenuItem3;
        private System.Windows.Forms.ToolStripMenuItem menu_framepanel_g1000nxi_pfd;
        private System.Windows.Forms.ToolStripMenuItem menu_framepanel_g1000nxi_mfd;
        private System.Windows.Forms.ToolStripMenuItem flyByWireA32NXToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_pfd_template_1;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_nd_template_1;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_eicas_1;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_eicas_2;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_cdu;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_dcdu;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_isis;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_fcu;
        private System.Windows.Forms.ToolStripMenuItem menu_webpanel_fbwa32nx_rmp;
        private System.Windows.Forms.ToolStripMenuItem a32NXToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem menu_framepanel_fbwa32nx_cdu;
        private System.Windows.Forms.ToolStripMenuItem a32NXToolStripMenuItem1;
        private System.Windows.Forms.ToolStripMenuItem menu_buttonpanel_fbwa32nx_cdu;
    }
}